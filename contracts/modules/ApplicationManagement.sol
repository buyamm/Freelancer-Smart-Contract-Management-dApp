// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../base/FreelancerModifiers.sol";
import "../libraries/FreelancerEvents.sol";

abstract contract ApplicationManagement is FreelancerModifiers {
    // Freelancer apply vào job
    function applyForJob(uint256 _jobId, string memory _proposal) 
        external 
        validState(_jobId, FreelancerTypes.ContractState.Funded) 
    {
        require(!hasApplied[_jobId][msg.sender], "Already applied for this job");
        require(msg.sender != jobs[_jobId].client, "Client cannot apply for own job");
        
        jobApplications[_jobId].push(FreelancerTypes.Application({
            freelancer: msg.sender,
            proposal: _proposal,
            appliedAt: block.timestamp,
            isSelected: false
        }));
        
        hasApplied[_jobId][msg.sender] = true;
        
        emit FreelancerEvents.FreelancerApplied(_jobId, msg.sender, _proposal);
    }

    // Client chọn freelancer từ danh sách ứng viên
    function selectFreelancer(uint256 _jobId, address _freelancer) 
        external 
        onlyClient(_jobId) 
        validState(_jobId, FreelancerTypes.ContractState.Funded) 
    {
        require(hasApplied[_jobId][_freelancer], "Freelancer has not applied");
        
        jobs[_jobId].freelancer = _freelancer;
        jobs[_jobId].state = FreelancerTypes.ContractState.InProgress;
        
        // Đánh dấu freelancer được chọn
        FreelancerTypes.Application[] storage applications = jobApplications[_jobId];
        for (uint i = 0; i < applications.length; i++) {
            if (applications[i].freelancer == _freelancer) {
                applications[i].isSelected = true;
                break;
            }
        }
        
        freelancerJobs[_freelancer].push(_jobId);
        
        emit FreelancerEvents.FreelancerSelected(_jobId, _freelancer, msg.sender);
        emit FreelancerEvents.ContractAccepted(_jobId, _freelancer);
    }

    // Giữ lại hàm acceptJob cũ cho backward compatibility
    function acceptJob(uint256 _jobId) 
        external 
        validState(_jobId, FreelancerTypes.ContractState.Funded) 
    {
        require(jobs[_jobId].freelancer == address(0), "Job already has a freelancer");
        require(msg.sender != jobs[_jobId].client, "Client cannot accept own job");
        require(jobApplications[_jobId].length == 0, "Job has applications, client must select");

        jobs[_jobId].freelancer = msg.sender;
        jobs[_jobId].state = FreelancerTypes.ContractState.InProgress;
        
        freelancerJobs[msg.sender].push(_jobId);

        emit FreelancerEvents.ContractAccepted(_jobId, msg.sender);
    }

    // View functions
    function getJobApplications(uint256 _jobId) external view returns (FreelancerTypes.Application[] memory) {
        return jobApplications[_jobId];
    }

    function getApplicationCount(uint256 _jobId) external view returns (uint256) {
        return jobApplications[_jobId].length;
    }

    function hasFreelancerApplied(uint256 _jobId, address _freelancer) external view returns (bool) {
        return hasApplied[_jobId][_freelancer];
    }
}