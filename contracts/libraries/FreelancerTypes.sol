// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library FreelancerTypes {
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

    struct Submission {
        string ipfsHash;
        uint256 submittedAt;
        string comment;
    }

    struct Application {
        address freelancer;
        string proposal;
        uint256 appliedAt;
        bool isSelected;
    }

    struct Rating {
        uint8 score;        // 1-5 sao
        string comment;
        uint256 ratedAt;
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
}