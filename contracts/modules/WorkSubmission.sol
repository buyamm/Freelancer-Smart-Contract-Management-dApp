// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../base/FreelancerModifiers.sol";
import "../libraries/FreelancerEvents.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

abstract contract WorkSubmission is FreelancerModifiers, ReentrancyGuard {
    // Freelancer nộp kết quả (lưu lịch sử)
    function submitWork(uint256 _jobId, string memory _ipfsHash, string memory _comment) 
        external 
        onlyFreelancer(_jobId) 
    {
        require(
            jobs[_jobId].state == FreelancerTypes.ContractState.InProgress || 
            jobs[_jobId].state == FreelancerTypes.ContractState.Submitted,
            "Invalid state for submission"
        );
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        
        bool isLate = block.timestamp > jobs[_jobId].deadline;
        
        // Lưu vào lịch sử submissions
        jobSubmissions[_jobId].push(FreelancerTypes.Submission({
            ipfsHash: _ipfsHash,
            submittedAt: block.timestamp,
            comment: _comment
        }));
        
        // Cập nhật job với submission mới nhất
        jobs[_jobId].ipfsHash = _ipfsHash;
        jobs[_jobId].state = FreelancerTypes.ContractState.Submitted;
        jobs[_jobId].submittedAt = block.timestamp;
        
        // Tính penalty nếu nộp muộn
        if (isLate) {
            jobs[_jobId].penaltyAmount = (jobs[_jobId].payment * PENALTY_RATE) / 100;
        }

        emit FreelancerEvents.ContractSubmitted(_jobId, _ipfsHash, isLate, jobSubmissions[_jobId].length - 1);
    }

    // Backward compatibility: submitWork không có comment
    function submitWork(uint256 _jobId, string memory _ipfsHash) external {
        this.submitWork(_jobId, _ipfsHash, "");
    }

    // Client duyệt kết quả
    function approveWork(uint256 _jobId) 
        external 
        onlyClient(_jobId) 
        validState(_jobId, FreelancerTypes.ContractState.Submitted) 
        nonReentrant 
    {
        jobs[_jobId].state = FreelancerTypes.ContractState.Completed;
        
        uint256 finalPayment = jobs[_jobId].payment - jobs[_jobId].penaltyAmount;
        address freelancer = jobs[_jobId].freelancer;
        
        (bool success, ) = freelancer.call{value: finalPayment}("");
        require(success, "Payment transfer failed");
        
        if (jobs[_jobId].penaltyAmount > 0) {
            (bool refundSuccess, ) = jobs[_jobId].client.call{value: jobs[_jobId].penaltyAmount}("");
            require(refundSuccess, "Penalty refund failed");
        }

        emit FreelancerEvents.ContractApproved(_jobId, msg.sender, finalPayment);
    }

    // Client từ chối kết quả
    function rejectWork(uint256 _jobId, string memory _reason) 
        external 
        onlyClient(_jobId) 
        validState(_jobId, FreelancerTypes.ContractState.Submitted) 
    {
        require(block.timestamp <= jobs[_jobId].deadline, "Cannot reject after deadline");
        
        jobs[_jobId].state = FreelancerTypes.ContractState.InProgress;
        jobs[_jobId].ipfsHash = "";
        jobs[_jobId].submittedAt = 0;
        jobs[_jobId].rejectionCount++;
        jobs[_jobId].penaltyAmount = 0;

        emit FreelancerEvents.ContractRejected(_jobId, _reason);
    }

    // Tự động duyệt
    function autoApproveWork(uint256 _jobId) 
        external 
        validState(_jobId, FreelancerTypes.ContractState.Submitted) 
        nonReentrant 
    {
        require(
            block.timestamp > jobs[_jobId].deadline + (AUTO_APPROVE_DAYS * 1 days),
            "Auto-approve period not reached"
        );
        
        jobs[_jobId].state = FreelancerTypes.ContractState.Completed;
        
        uint256 finalPayment = jobs[_jobId].payment - jobs[_jobId].penaltyAmount;
        address freelancer = jobs[_jobId].freelancer;
        
        (bool success, ) = freelancer.call{value: finalPayment}("");
        require(success, "Payment transfer failed");
        
        if (jobs[_jobId].penaltyAmount > 0) {
            (bool refundSuccess, ) = jobs[_jobId].client.call{value: jobs[_jobId].penaltyAmount}("");
            require(refundSuccess, "Penalty refund failed");
        }

        emit FreelancerEvents.AutoApproved(_jobId, finalPayment);
    }

    // View functions
    function getJobSubmissions(uint256 _jobId) external view returns (FreelancerTypes.Submission[] memory) {
        return jobSubmissions[_jobId];
    }

    function getSubmissionCount(uint256 _jobId) external view returns (uint256) {
        return jobSubmissions[_jobId].length;
    }

    function canAutoApprove(uint256 _jobId) external view returns (bool) {
        return jobs[_jobId].state == FreelancerTypes.ContractState.Submitted && 
               block.timestamp > jobs[_jobId].deadline + (AUTO_APPROVE_DAYS * 1 days);
    }
}