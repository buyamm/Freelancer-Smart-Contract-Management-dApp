// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FreelancerContract is ReentrancyGuard, Ownable {
    enum ContractState {
        Pending,
        Funded,
        InProgress,
        Submitted,
        Completed,
        Canceled
    }

    struct ContactInfo {
        string name;
        string email;
        string phone;
        string chatLink;
    }

    struct Job {
        uint256 id;
        address client;
        address freelancer;
        string title;
        string description;
        uint256 payment;
        uint256 deadline;
        ContractState state;
        string ipfsHash;
        uint256 createdAt;
        uint256 submittedAt;
        uint256 rejectionCount;
        uint256 penaltyAmount;
    }

    mapping(uint256 => Job) public jobs;
    mapping(address => uint256[]) public clientJobs;
    mapping(address => uint256[]) public freelancerJobs;
    mapping(address => ContactInfo) public contactInfo;
    
    uint256 public jobCounter;
    uint256 public constant AUTO_APPROVE_DAYS = 3; // Tự động duyệt sau 3 ngày
    uint256 public constant PENALTY_RATE = 10; // 10% phạt khi nộp muộn

    event ContractCreated(uint256 indexed jobId, address indexed client, string title, uint256 payment);
    event ContractFunded(uint256 indexed jobId, address indexed client, uint256 amount);
    event ContractAccepted(uint256 indexed jobId, address indexed freelancer);
    event ContractSubmitted(uint256 indexed jobId, string ipfsHash, bool isLate);
    event ContractApproved(uint256 indexed jobId, address indexed client, uint256 finalPayment);
    event ContractRejected(uint256 indexed jobId, string reason);
    event ContractCanceled(uint256 indexed jobId, string reason);
    event DeadlineExtended(uint256 indexed jobId, uint256 newDeadline);
    event FreelancerRemoved(uint256 indexed jobId);
    event ContactInfoUpdated(address indexed user);
    event AutoApproved(uint256 indexed jobId, uint256 finalPayment);

    modifier onlyClient(uint256 _jobId) {
        require(jobs[_jobId].client == msg.sender, "Only client can perform this action");
        _;
    }

    modifier onlyFreelancer(uint256 _jobId) {
        require(jobs[_jobId].freelancer == msg.sender, "Only freelancer can perform this action");
        _;
    }

    modifier validState(uint256 _jobId, ContractState _state) {
        require(jobs[_jobId].state == _state, "Invalid contract state");
        _;
    }

    constructor() Ownable(msg.sender) {}

    // Cập nhật thông tin liên lạc
    function updateContactInfo(
        string memory _name,
        string memory _email,
        string memory _phone,
        string memory _chatLink
    ) external {
        contactInfo[msg.sender] = ContactInfo({
            name: _name,
            email: _email,
            phone: _phone,
            chatLink: _chatLink
        });
        
        emit ContactInfoUpdated(msg.sender);
    }

    // Tạo job mới
    function createJob(
        string memory _title,
        string memory _description,
        uint256 _deadline
    ) external payable {
        require(msg.value > 0, "Payment must be greater than 0");
        require(_deadline > block.timestamp, "Deadline must be in the future");

        jobCounter++;
        
        jobs[jobCounter] = Job({
            id: jobCounter,
            client: msg.sender,
            freelancer: address(0),
            title: _title,
            description: _description,
            payment: msg.value,
            deadline: _deadline,
            state: ContractState.Funded,
            ipfsHash: "",
            createdAt: block.timestamp,
            submittedAt: 0,
            rejectionCount: 0,
            penaltyAmount: 0
        });

        clientJobs[msg.sender].push(jobCounter);
        
        emit ContractCreated(jobCounter, msg.sender, _title, msg.value);
        emit ContractFunded(jobCounter, msg.sender, msg.value);
    }

    // Freelancer nhận job
    function acceptJob(uint256 _jobId) external validState(_jobId, ContractState.Funded) {
        require(jobs[_jobId].freelancer == address(0), "Job already has a freelancer");
        require(msg.sender != jobs[_jobId].client, "Client cannot accept own job");

        jobs[_jobId].freelancer = msg.sender;
        jobs[_jobId].state = ContractState.InProgress;
        
        freelancerJobs[msg.sender].push(_jobId);

        emit ContractAccepted(_jobId, msg.sender);
    }

    // Freelancer nộp kết quả
    function submitWork(uint256 _jobId, string memory _ipfsHash) 
        external 
        onlyFreelancer(_jobId) 
    {
        require(
            jobs[_jobId].state == ContractState.InProgress || 
            jobs[_jobId].state == ContractState.Submitted,
            "Invalid state for submission"
        );
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        
        bool isLate = block.timestamp > jobs[_jobId].deadline;
        
        jobs[_jobId].ipfsHash = _ipfsHash;
        jobs[_jobId].state = ContractState.Submitted;
        jobs[_jobId].submittedAt = block.timestamp;
        
        // Tính penalty nếu nộp muộn
        if (isLate) {
            jobs[_jobId].penaltyAmount = (jobs[_jobId].payment * PENALTY_RATE) / 100;
        }

        emit ContractSubmitted(_jobId, _ipfsHash, isLate);
    }

    // Client duyệt kết quả
    function approveWork(uint256 _jobId) 
        external 
        onlyClient(_jobId) 
        validState(_jobId, ContractState.Submitted) 
        nonReentrant 
    {
        jobs[_jobId].state = ContractState.Completed;
        
        uint256 finalPayment = jobs[_jobId].payment - jobs[_jobId].penaltyAmount;
        address freelancer = jobs[_jobId].freelancer;
        
        // Trả tiền cho freelancer
        (bool success, ) = freelancer.call{value: finalPayment}("");
        require(success, "Payment transfer failed");
        
        // Trả lại penalty cho client nếu có
        if (jobs[_jobId].penaltyAmount > 0) {
            (bool refundSuccess, ) = jobs[_jobId].client.call{value: jobs[_jobId].penaltyAmount}("");
            require(refundSuccess, "Penalty refund failed");
        }

        emit ContractApproved(_jobId, msg.sender, finalPayment);
    }

    // Client từ chối kết quả (chỉ được phép trước deadline)
    function rejectWork(uint256 _jobId, string memory _reason) 
        external 
        onlyClient(_jobId) 
        validState(_jobId, ContractState.Submitted) 
    {
        require(block.timestamp <= jobs[_jobId].deadline, "Cannot reject after deadline");
        
        jobs[_jobId].state = ContractState.InProgress;
        jobs[_jobId].ipfsHash = "";
        jobs[_jobId].submittedAt = 0;
        jobs[_jobId].rejectionCount++;
        jobs[_jobId].penaltyAmount = 0; // Reset penalty

        emit ContractRejected(_jobId, _reason);
    }

    // Tự động duyệt nếu client không phản hồi sau deadline + AUTO_APPROVE_DAYS
    function autoApproveWork(uint256 _jobId) 
        external 
        validState(_jobId, ContractState.Submitted) 
        nonReentrant 
    {
        require(
            block.timestamp > jobs[_jobId].deadline + (AUTO_APPROVE_DAYS * 1 days),
            "Auto-approve period not reached"
        );
        
        jobs[_jobId].state = ContractState.Completed;
        
        uint256 finalPayment = jobs[_jobId].payment - jobs[_jobId].penaltyAmount;
        address freelancer = jobs[_jobId].freelancer;
        
        // Trả tiền cho freelancer
        (bool success, ) = freelancer.call{value: finalPayment}("");
        require(success, "Payment transfer failed");
        
        // Trả lại penalty cho client nếu có
        if (jobs[_jobId].penaltyAmount > 0) {
            (bool refundSuccess, ) = jobs[_jobId].client.call{value: jobs[_jobId].penaltyAmount}("");
            require(refundSuccess, "Penalty refund failed");
        }

        emit AutoApproved(_jobId, finalPayment);
    }

    // Client gia hạn deadline
    function extendDeadline(uint256 _jobId, uint256 _newDeadline) 
        external 
        onlyClient(_jobId) 
    {
        require(
            jobs[_jobId].state == ContractState.InProgress || 
            jobs[_jobId].state == ContractState.Submitted,
            "Invalid state for deadline extension"
        );
        require(_newDeadline > jobs[_jobId].deadline, "New deadline must be later");
        
        jobs[_jobId].deadline = _newDeadline;
        jobs[_jobId].penaltyAmount = 0; // Reset penalty khi gia hạn
        
        emit DeadlineExtended(_jobId, _newDeadline);
    }

    // Client xóa freelancer và đưa job về trạng thái Funded
    function removeFreelancer(uint256 _jobId) 
        external 
        onlyClient(_jobId) 
    {
        require(
            jobs[_jobId].state == ContractState.InProgress || 
            jobs[_jobId].state == ContractState.Submitted,
            "Invalid state for removing freelancer"
        );
        
        jobs[_jobId].freelancer = address(0);
        jobs[_jobId].state = ContractState.Funded;
        jobs[_jobId].ipfsHash = "";
        jobs[_jobId].submittedAt = 0;
        jobs[_jobId].rejectionCount = 0;
        jobs[_jobId].penaltyAmount = 0;
        
        emit FreelancerRemoved(_jobId);
    }

    // Client hủy job (chỉ khi chưa có freelancer hoặc quá deadline)
    function cancelJob(uint256 _jobId, string memory _reason) 
        external 
        onlyClient(_jobId) 
        nonReentrant 
    {
        ContractState currentState = jobs[_jobId].state;
        require(
            currentState == ContractState.Funded || 
            (currentState == ContractState.InProgress && block.timestamp > jobs[_jobId].deadline),
            "Cannot cancel job in current state"
        );

        jobs[_jobId].state = ContractState.Canceled;
        
        uint256 refund = jobs[_jobId].payment;
        address client = jobs[_jobId].client;
        
        (bool success, ) = client.call{value: refund}("");
        require(success, "Refund transfer failed");

        emit ContractCanceled(_jobId, _reason);
    }

    // View functions
    function getJob(uint256 _jobId) external view returns (Job memory) {
        return jobs[_jobId];
    }

    function getClientJobs(address _client) external view returns (uint256[] memory) {
        return clientJobs[_client];
    }

    function getFreelancerJobs(address _freelancer) external view returns (uint256[] memory) {
        return freelancerJobs[_freelancer];
    }

    function getContactInfo(address _user) external view returns (ContactInfo memory) {
        return contactInfo[_user];
    }

    function isDeadlinePassed(uint256 _jobId) external view returns (bool) {
        return block.timestamp > jobs[_jobId].deadline;
    }

    function canAutoApprove(uint256 _jobId) external view returns (bool) {
        return jobs[_jobId].state == ContractState.Submitted && 
               block.timestamp > jobs[_jobId].deadline + (AUTO_APPROVE_DAYS * 1 days);
    }

    function getPenaltyAmount(uint256 _jobId) external view returns (uint256) {
        return jobs[_jobId].penaltyAmount;
    }
}
