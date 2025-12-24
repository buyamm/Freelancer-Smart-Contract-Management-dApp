// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./FreelancerStorage.sol";

abstract contract FreelancerModifiers is FreelancerStorage {
    modifier onlyClient(uint256 _jobId) {
        require(jobs[_jobId].client == msg.sender, "Only client can perform this action");
        _;
    }

    modifier onlyFreelancer(uint256 _jobId) {
        require(jobs[_jobId].freelancer == msg.sender, "Only freelancer can perform this action");
        _;
    }

    modifier validState(uint256 _jobId, FreelancerTypes.ContractState _state) {
        require(jobs[_jobId].state == _state, "Invalid contract state");
        _;
    }
}