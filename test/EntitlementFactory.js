const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Entitlement factory", () => {

  let factory;
  let testToken;
  let tokenSupply = 1_000_000;
  let recipient;
  const amount = 100;
  const period = 90;

  beforeEach(async () => {
    const TestToken = await ethers.getContractFactory("TestToken");
    testToken = await TestToken.deploy("Test Token", "T_T", tokenSupply);

    [creator, recipient] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("EntitlementFactory");
    factory = await Factory.deploy();
  });

  describe("Creating a entitlement", () => {
    beforeEach(async () => {
      await factory.createEntitlement(recipient.address, testToken.address, amount, period);
    });

    it("Should record the address of a created entitlement", async () => {
      const createdEntitlements = await factory.getCreatedEntitlements();
      expect(createdEntitlements[0]).to.be.properAddress;
    });

    it("Should record the address of a recieved entitlement", async () => {
      const recievedEntitlements = await factory.connect(recipient).getReceivedEntitlements();
      expect(recievedEntitlements[0]).to.be.properAddress;
    });
  })
});