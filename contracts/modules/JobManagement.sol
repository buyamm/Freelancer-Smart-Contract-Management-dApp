// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../base/FreelancerModifiers.sol";
import "../libraries/FreelancerEvents.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

abstract contract JobManagement is FreelancerModifiers, ReentrancyGuard {
    // Tạo job mới
    function createJob(
        string memory _title,
        string memory _description,
        uint256 _deadline
    ) external payable {
        require(msg.value > 0, "Payment must be greater than 0");
        require(_deadline > block.timestamp, "Deadline must be in the future");

        jobCounter++;
        
        jobs[jobCounter] = FreelancerTypes.Job({
            id: jobCounter,
            client: msg.sender,
            freelancer: address(0),
            title: _title,
            description: _description,
            payment: msg.value,
            deadline: _deadline,
            state: FreelancerTypes.ContractState.Funded,
            ipfsHash: "",
            createdAt: block.timestamp,
            submittedAt: 0,
            rejectionCount: 0,
            penaltyAmount: 0
        });

        clientJobs[msg.sender].push(jobCounter);
        
        emit FreelancerEvents.ContractCreated(jobCounter, msg.sender, _title, msg.value);
        emit FreelancerEvents.ContractFunded(jobCounter, msg.sender, msg.value);
    }

    // Client gia hạn deadline
    function extendDeadline(uint256 _jobId, uint256 _newDeadline) 
        external 
        onlyClient(_jobId) 
    {
        require(
            jobs[_jobId].state == FreelancerTypes.ContractState.InProgress || 
            jobs[_jobId].state == FreelancerTypes.ContractState.Submitted,
            "Invalid state for deadline extension"
        );
        require(_newDeadline > jobs[_jobId].deadline, "New deadline must be later");
        
        jobs[_jobId].deadline = _newDeadline;
        jobs[_jobId].penaltyAmount = 0;
        
        emit FreelancerEvents.DeadlineExtended(_jobId, _newDeadline);
    }

    // Client xóa freelancer
    function removeFreelancer(uint256 _jobId) 
        external 
        onlyClient(_jobId) 
    {
        require(
            jobs[_jobId].state == FreelancerTypes.ContractState.InProgress || 
            jobs[_jobId].state == FreelancerTypes.ContractState.Submitted,
            "Invalid state for removing freelancer"
        );
        
        jobs[_jobId].freelancer = address(0);
        jobs[_jobId].state = FreelancerTypes.ContractState.Funded;
        jobs[_jobId].ipfsHash = "";
        jobs[_jobId].submittedAt = 0;
        jobs[_jobId].rejectionCount = 0;
        jobs[_jobId].penaltyAmount = 0;
        
        emit FreelancerEvents.FreelancerRemoved(_jobId);
    }

    // Client hủy job
    function cancelJob(uint256 _jobId, string memory _reason) 
        external 
        onlyClient(_jobId) 
        nonReentrant 
    {
        FreelancerTypes.ContractState currentState = jobs[_jobId].state;
        require(
            currentState == FreelancerTypes.ContractState.Funded || 
            (currentState == FreelancerTypes.ContractState.InProgress && block.timestamp > jobs[_jobId].deadline),
            "Cannot cancel job in current state"
        );

        jobs[_jobId].state = FreelancerTypes.ContractState.Canceled;
        
        uint256 refund = jobs[_jobId].payment;
        address client = jobs[_jobId].client;
        
        (bool success, ) = client.call{value: refund}("");
        require(success, "Refund transfer failed");

        emit FreelancerEvents.ContractCanceled(_jobId, _reason);
    }

    // View functions
    function getJob(uint256 _jobId) external view returns (FreelancerTypes.Job memory) {
        return jobs[_jobId];
    }

    function getClientJobs(address _client) external view returns (uint256[] memory) {
        return clientJobs[_client];
    }

    function getFreelancerJobs(address _freelancer) external view returns (uint256[] memory) {
        return freelancerJobs[_freelancer];
    }

    function isDeadlinePassed(uint256 _jobId) external view returns (bool) {
        return block.timestamp > jobs[_jobId].deadline;
    }

    function getPenaltyAmount(uint256 _jobId) external view returns (uint256) {
        return jobs[_jobId].penaltyAmount;
    }
}