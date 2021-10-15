const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Entitlement contract", () => {

  let testToken;
  let entitlement;
  let owner;  
  let recipient;

  beforeEach(async () => {
    const TestToken = await ethers.getContractFactory("TestToken");
    testToken = await TestToken.deploy("Test Token", "T_T", 1_000_000);

    [owner, recipient] = await ethers.getSigners();

    const Entitlement = await ethers.getContractFactory("Entitlement");
    entitlement = await Entitlement.deploy(recipient.address, testToken.address, 30);

    testToken.increaseAllowance(entitlement.address, 100);
  });

  describe("Deployment", () => {
    it("Set deploying account as the owner", async () => {
      expect(await entitlement.owner()).to.equal(owner.address);
    });

    it("Allows the owner to fund the entitlement", async () => {
      await entitlement.fundEntitlement(100);
      expect(await testToken.balanceOf(entitlement.address)).to.equal(100);
    });
  });

});
