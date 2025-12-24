// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../libraries/FreelancerTypes.sol";

abstract contract FreelancerStorage {
    using FreelancerTypes for *;
    
    // Constants
    uint256 public constant AUTO_APPROVE_DAYS = 3;
    uint256 public constant PENALTY_RATE = 10;
    
    // State variables
    uint256 public jobCounter;
    
    // Mappings
    mapping(uint256 => FreelancerTypes.Job) public jobs;
    mapping(address => uint256[]) public clientJobs;
    mapping(address => uint256[]) public freelancerJobs;
    mapping(address => FreelancerTypes.ContactInfo) public contactInfo;
    
    // Application mappings
    mapping(uint256 => FreelancerTypes.Application[]) public jobApplications;
    mapping(uint256 => mapping(address => bool)) public hasApplied;
    
    // Submission mappings
    mapping(uint256 => FreelancerTypes.Submission[]) public jobSubmissions;
    
    // Rating mappings
    mapping(uint256 => FreelancerTypes.Rating) public jobRatings;
    mapping(address => uint256) public freelancerTotalRatings;
    mapping(address => uint256) public freelancerRatingCount;
}