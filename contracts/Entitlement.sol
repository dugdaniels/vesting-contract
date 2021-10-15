//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";


contract Entitlement is Ownable {

    using SafeERC20 for IERC20;

    address depositor;
    address public recipient;
    address token;
    uint originationTime = block.timestamp;
    uint releaseTime;

    constructor(address _recipient, address _token, uint _periodInDays) {
        recipient = _recipient;
        token = _token;
        releaseTime = block.timestamp + (_periodInDays * 1 days);
    }

    function fundEntitlement(uint _amount) public onlyOwner {
        IERC20(token).safeTransferFrom(msg.sender, address(this), _amount);
    }

    function terminate() public onlyOwner {

    }

    function accelerate() public onlyOwner {

    }

    // function claim() public {
    //     require(msg.sender == recipient, "Only the recipeient can claim funds");
    //     require(block.timestamp >= releaseTime, "The vestement period has not passed");
    //     uint payout = balance;
    //     balance = 0;
    //     IERC20(token).safeTransferFrom(address(this), recipient, payout);
    // }

}
