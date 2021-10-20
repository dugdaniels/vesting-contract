//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Entitlement.sol";

contract EntitlementFactory {   

Entitlement[] public entitlements;

    mapping(address => address[]) entitlementsCreated;
    mapping(address => address[]) entitlementsRecieved;

    function createEntitlement(address _recipient, address _token, uint _amount, uint _periodInDays) public {
        Entitlement entitlement = new Entitlement(_recipient, _token, _amount, _periodInDays);
        entitlements.push(entitlement);
        entitlementsCreated[msg.sender].push(address(entitlement));
        entitlementsRecieved[_recipient].push(address(entitlement));
    }

    function getCreatedEntitlements() public view returns(address[] memory) {
        return entitlementsCreated[msg.sender];
    }

    function getReceivedEntitlements() public view returns(address[] memory) {
        return entitlementsRecieved[msg.sender];
    }
}