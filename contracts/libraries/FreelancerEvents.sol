// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library FreelancerEvents {
    // Job Management Events
    event ContractCreated(uint256 indexed jobId, address indexed client, string title, uint256 payment);
    event ContractFunded(uint256 indexed jobId, address indexed client, uint256 amount);
    event ContractCanceled(uint256 indexed jobId, string reason);
    event DeadlineExtended(uint256 indexed jobId, uint256 newDeadline);
    event FreelancerRemoved(uint256 indexed jobId);
    
    // Application Events
    event FreelancerApplied(uint256 indexed jobId, address indexed freelancer, string proposal);
    event FreelancerSelected(uint256 indexed jobId, address indexed freelancer, address indexed client);
    event ContractAccepted(uint256 indexed jobId, address indexed freelancer);
    
    // Work Submission Events
    event ContractSubmitted(uint256 indexed jobId, string ipfsHash, bool isLate, uint256 submissionIndex);
    event ContractApproved(uint256 indexed jobId, address indexed client, uint256 finalPayment);
    event ContractRejected(uint256 indexed jobId, string reason);
    event AutoApproved(uint256 indexed jobId, uint256 finalPayment);
    
    // Rating Events
    event FreelancerRated(uint256 indexed jobId, address indexed freelancer, uint8 score, string comment);
    
    // Contact Events
    event ContactInfoUpdated(address indexed user);
}