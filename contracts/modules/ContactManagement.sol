// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../base/FreelancerModifiers.sol";
import "../libraries/FreelancerEvents.sol";

abstract contract ContactManagement is FreelancerModifiers {
    // Cập nhật thông tin liên lạc
    function updateContactInfo(
        string memory _name,
        string memory _email,
        string memory _phone,
        string memory _chatLink
    ) external {
        contactInfo[msg.sender] = FreelancerTypes.ContactInfo({
            name: _name,
            email: _email,
            phone: _phone,
            chatLink: _chatLink
        });
        
        emit FreelancerEvents.ContactInfoUpdated(msg.sender);
    }

    // View function
    function getContactInfo(address _user) external view returns (FreelancerTypes.ContactInfo memory) {
        return contactInfo[_user];
    }
}