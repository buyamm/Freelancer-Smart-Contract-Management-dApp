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
        Canceled,
        Disputed
    }

    struct Job {
        uint256 id;
        address client;
        address freelancer;
        address arbiter;
        string title;
        string description;
        uint256 payment;
        uint256 deadline;
        ContractState state;
        string ipfsHash;
        uint256 createdAt;
        uint256 submittedAt;
    }

    mapping(uint256 => Job) public jobs;
    mapping(address => uint256[]) public clientJobs;
    mapping(address => uint256[]) public freelancerJobs;
    mapping(address => uint256[]) public arbiterJobs;
    
    uint256 public jobCounter;
    uint256 public constant ARBITER_FEE = 5; // 5%

    event ContractCreated(uint256 indexed jobId, address indexed client, string title, uint256 payment);
    event ContractFunded(uint256 indexed jobId, address indexed client, uint256 amount);
    event ContractAccepted(uint256 indexed jobId, address indexed freelancer);
    event ContractSubmitted(uint256 indexed jobId, string ipfsHash);
    event ContractApproved(uint256 indexed jobId, address indexed client);
    event ContractCanceled(uint256 indexed jobId, string reason);
    event DisputeOpened(uint256 indexed jobId, address indexed opener);
    event DisputeResolved(uint256 indexed jobId, address indexed arbiter, uint256 clientAmount, uint256 freelancerAmount);

    modifier onlyClient(uint256 _jobId) {
        require(jobs[_jobId].client == msg.sender, "Only client can perform this action");
        _;
    }

    modifier onlyFreelancer(uint256 _jobId) {
        require(jobs[_jobId].freelancer == msg.sender, "Only freelancer can perform this action");
        _;
    }

    modifier onlyArbiter(uint256 _jobId) {
        require(jobs[_jobId].arbiter == msg.sender, "Only arbiter can perform this action");
        _;
    }

    modifier validState(uint256 _jobId, ContractState _state) {
        require(jobs[_jobId].state == _state, "Invalid contract state");
        _;
    }

    constructor() Ownable(msg.sender) {}

    function createJob(
        string memory _title,
        string memory _description,
        uint256 _deadline,
        address _arbiter
    ) external payable {
        require(msg.value > 0, "Payment must be greater than 0");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(_arbiter != address(0), "Invalid arbiter address");

        jobCounter++;
        
        jobs[jobCounter] = Job({
            id: jobCounter,
            client: msg.sender,
            freelancer: address(0),
            arbiter: _arbiter,
            title: _title,
            description: _description,
            payment: msg.value,
            deadline: _deadline,
            state: ContractState.Funded,
            ipfsHash: "",
            createdAt: block.timestamp,
            submittedAt: 0
        });

        clientJobs[msg.sender].push(jobCounter);
        
        emit ContractCreated(jobCounter, msg.sender, _title, msg.value);
        emit ContractFunded(jobCounter, msg.sender, msg.value);
    }

    function acceptJob(uint256 _jobId) external validState(_jobId, ContractState.Funded) {
        require(jobs[_jobId].freelancer == address(0), "Job already has a freelancer");
        require(msg.sender != jobs[_jobId].client, "Client cannot accept own job");

        jobs[_jobId].freelancer = msg.sender;
        jobs[_jobId].state = ContractState.InProgress;
        
        freelancerJobs[msg.sender].push(_jobId);
        arbiterJobs[jobs[_jobId].arbiter].push(_jobId);

        emit ContractAccepted(_jobId, msg.sender);
    }   
 function submitWork(uint256 _jobId, string memory _ipfsHash) 
        external 
        onlyFreelancer(_jobId) 
        validState(_jobId, ContractState.InProgress) 
    {
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        
        jobs[_jobId].ipfsHash = _ipfsHash;
        jobs[_jobId].state = ContractState.Submitted;
        jobs[_jobId].submittedAt = block.timestamp;

        emit ContractSubmitted(_jobId, _ipfsHash);
    }

    function approveWork(uint256 _jobId) 
        external 
        onlyClient(_jobId) 
        validState(_jobId, ContractState.Submitted) 
        nonReentrant 
    {
        jobs[_jobId].state = ContractState.Completed;
        
        uint256 payment = jobs[_jobId].payment;
        address freelancer = jobs[_jobId].freelancer;
        
        (bool success, ) = freelancer.call{value: payment}("");
        require(success, "Payment transfer failed");

        emit ContractApproved(_jobId, msg.sender);
    }

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

    function openDispute(uint256 _jobId) external {
        require(
            msg.sender == jobs[_jobId].client || msg.sender == jobs[_jobId].freelancer,
            "Only client or freelancer can open dispute"
        );
        require(
            jobs[_jobId].state == ContractState.InProgress || 
            jobs[_jobId].state == ContractState.Submitted,
            "Invalid state for dispute"
        );

        jobs[_jobId].state = ContractState.Disputed;
        emit DisputeOpened(_jobId, msg.sender);
    }

    function resolveDispute(
        uint256 _jobId, 
        uint256 _clientPercentage
    ) external onlyArbiter(_jobId) validState(_jobId, ContractState.Disputed) nonReentrant {
        require(_clientPercentage <= 100, "Invalid percentage");

        jobs[_jobId].state = ContractState.Completed;
        
        uint256 totalPayment = jobs[_jobId].payment;
        uint256 arbiterFee = (totalPayment * ARBITER_FEE) / 100;
        uint256 remainingAmount = totalPayment - arbiterFee;
        
        uint256 clientAmount = (remainingAmount * _clientPercentage) / 100;
        uint256 freelancerAmount = remainingAmount - clientAmount;

        // Transfer arbiter fee
        if (arbiterFee > 0) {
            (bool arbiterSuccess, ) = jobs[_jobId].arbiter.call{value: arbiterFee}("");
            require(arbiterSuccess, "Arbiter fee transfer failed");
        }

        // Transfer to client
        if (clientAmount > 0) {
            (bool clientSuccess, ) = jobs[_jobId].client.call{value: clientAmount}("");
            require(clientSuccess, "Client transfer failed");
        }

        // Transfer to freelancer
        if (freelancerAmount > 0) {
            (bool freelancerSuccess, ) = jobs[_jobId].freelancer.call{value: freelancerAmount}("");
            require(freelancerSuccess, "Freelancer transfer failed");
        }

        emit DisputeResolved(_jobId, msg.sender, clientAmount, freelancerAmount);
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

    function getArbiterJobs(address _arbiter) external view returns (uint256[] memory) {
        return arbiterJobs[_arbiter];
    }

    function isDeadlinePassed(uint256 _jobId) external view returns (bool) {
        return block.timestamp > jobs[_jobId].deadline;
    }
}