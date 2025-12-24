// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../base/FreelancerModifiers.sol";
import "../libraries/FreelancerEvents.sol";

abstract contract RatingSystem is FreelancerModifiers {
    // Client đánh giá freelancer sau khi hoàn thành
    function rateFreelancer(uint256 _jobId, uint8 _score, string memory _comment) 
        external 
        onlyClient(_jobId) 
        validState(_jobId, FreelancerTypes.ContractState.Completed) 
    {
        require(_score >= 1 && _score <= 5, "Score must be between 1 and 5");
        require(jobRatings[_jobId].ratedAt == 0, "Already rated");
        
        address freelancer = jobs[_jobId].freelancer;
        
        jobRatings[_jobId] = FreelancerTypes.Rating({
            score: _score,
            comment: _comment,
            ratedAt: block.timestamp
        });
        
        // Cập nhật tổng đánh giá của freelancer
        freelancerTotalRatings[freelancer] += _score;
        freelancerRatingCount[freelancer]++;
        
        emit FreelancerEvents.FreelancerRated(_jobId, freelancer, _score, _comment);
    }

    // View functions
    function getJobRating(uint256 _jobId) external view returns (FreelancerTypes.Rating memory) {
        return jobRatings[_jobId];
    }

    function getFreelancerAverageRating(address _freelancer) external view returns (uint256 average, uint256 count) {
        count = freelancerRatingCount[_freelancer];
        if (count == 0) {
            return (0, 0);
        }
        average = (freelancerTotalRatings[_freelancer] * 100) / count; // Nhân 100 để giữ 2 số thập phân
        return (average, count);
    }
}