// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./modules/ContactManagement.sol";
import "./modules/JobManagement.sol";
import "./modules/ApplicationManagement.sol";
import "./modules/WorkSubmission.sol";
import "./modules/RatingSystem.sol";

/**
 * @title FreelancerContract
 * @dev Main contract that inherits all modules for freelancer platform functionality
 */
contract FreelancerContract is 
    Ownable,
    ContactManagement,
    JobManagement,
    ApplicationManagement,
    WorkSubmission,
    RatingSystem
{
    constructor() Ownable(msg.sender) {}
}