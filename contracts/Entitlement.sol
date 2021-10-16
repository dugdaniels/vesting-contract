//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Entitlement is Ownable {
    
    using SafeERC20 for IERC20;

    enum Status {
        Pending,
        Active,
        Completed
    }

    address depositor;
    address public recipient;
    address public token;
    uint public amount;
    uint public periodInDays;
    uint public startTime;
    Status public status;

    constructor(address _recipient, address _token, uint _amount, uint _periodInDays) {
        require(_amount > 0, "Token amount must be greater than zero");
        recipient = _recipient;
        token = _token;
        amount = _amount;
        periodInDays = _periodInDays;
    }

    modifier onlyActive() {
        require(status == Status.Active, "Entitlement is not active");
        _;
    }

    function getReleaseTime() public view returns (uint) {
        return startTime + (periodInDays * 1 days);
    }

    function fundEntitlement() public onlyOwner {
        require(status == Status.Pending, "Entitlement has already been funded");
        status = Status.Active;
        startTime = block.timestamp;
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
    }

    function accelerate() public onlyOwner onlyActive {
        periodInDays = 0;
    }

    function terminate() public onlyOwner onlyActive {
        status = Status.Completed;
        if (block.timestamp >= getReleaseTime()) {
            IERC20(token).safeTransfer(recipient, amount);
        } else {
            uint bigNum = 1_000_000_000_000_000_000;
            uint percentEarned = (block.timestamp - startTime) / 1 days * bigNum / periodInDays;
            uint amountEarned = percentEarned * amount / bigNum;
            IERC20(token).safeTransfer(recipient, amountEarned);
            IERC20(token).safeTransfer(owner(), amount - amountEarned);
        }
    }

    function claim() public onlyActive {
        require(msg.sender == recipient, "Only the recipeient can claim funds");
        require(block.timestamp >= getReleaseTime(), "Vestement period has not passed");
        status = Status.Completed;
        IERC20(token).safeTransfer(recipient, amount);
    }

}
