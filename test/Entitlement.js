const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Entitlement contract", () => {

  let testToken;
  let tokenSupply = 1_000_000;
  let entitlement;
  let owner;  
  let recipient;
  const amount = 100;
  const period = 90;
  const secondsPerDay = 86_400;

  beforeEach(async () => {
    const TestToken = await ethers.getContractFactory("TestToken");
    testToken = await TestToken.deploy("Test Token", "T_T", tokenSupply);

    [owner, recipient] = await ethers.getSigners();

    const Entitlement = await ethers.getContractFactory("Entitlement");
    entitlement = await Entitlement.deploy(recipient.address, testToken.address, amount, period);

    testToken.increaseAllowance(entitlement.address, amount);
  });

  describe("Deployment", () => {
    it("Set deploying account as the owner", async () => {
      expect(await entitlement.owner()).to.equal(owner.address);
    });

    it("Sets the entitlement details correctly", async () => {
      expect(await entitlement.recipient()).to.equal(recipient.address);
      expect(await entitlement.token()).to.equal(testToken.address);
      expect(await entitlement.periodInDays()).to.equal(period);
    });

    it("It is created as pending", async () => {
      expect(await entitlement.status()).to.equal(0);
    });
  });

  describe("Funding", () => {
    it("Should allow the owner to fund the entitlement", async () => {
      await entitlement.fundEntitlement();
      expect(await testToken.balanceOf(entitlement.address)).to.equal(amount);
    });

    it("Should not allow non-owners to fund the entitlement", async () => {
      await expect(
        entitlement.connect(recipient).fundEntitlement()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should only allow funding once", async () => {
      await entitlement.fundEntitlement();
      await expect(
        entitlement.fundEntitlement()
      ).to.be.revertedWith("Entitlement has already been funded");
    });

    it("Should set entitlement status to active when funded", async () => {
      await entitlement.fundEntitlement();
      expect(await entitlement.status()).to.equal(1);
    });    
    
    it("Should set the start time to the current block timestamp", async () => {
      await entitlement.fundEntitlement();

      const blockNumber = await ethers.provider.getBlockNumber();
      const block = await ethers.provider.getBlock(blockNumber);
      const timestamp = block.timestamp;
      expect(await entitlement.startTime()).to.equal(timestamp);
    });

    it("Should calculate a correct release time", async () => {
      await entitlement.fundEntitlement();

      const blockNumber = await ethers.provider.getBlockNumber();
      const block = await ethers.provider.getBlock(blockNumber);
      const timestamp = block.timestamp;
      const expectedReleaseTime = period * secondsPerDay + timestamp

      expect(await entitlement.getReleaseTime()).to.equal(expectedReleaseTime);
    });
  });  

  describe("Claiming entitlement", () => {
    it("Should transfer token balance to the recipient", async () => {
      await entitlement.fundEntitlement();
      await network.provider.send("evm_increaseTime", [period * secondsPerDay]);
      await entitlement.connect(recipient).claim();
      expect(await testToken.balanceOf(recipient.address)).to.equal(amount);
      expect(await testToken.balanceOf(entitlement.address)).to.equal(0);
    });

    it("Should only allow claiming after vesting", async () => {
      await entitlement.fundEntitlement();
      await expect(
        entitlement.connect(recipient).claim()
      ).to.be.revertedWith("Vestement period has not passed");

      await network.provider.send("evm_increaseTime", [period * secondsPerDay]);
      await entitlement.connect(recipient).claim();
      expect(await testToken.balanceOf(recipient.address)).to.equal(amount);
      expect(await testToken.balanceOf(entitlement.address)).to.equal(0);
    });

    it("Should only allow the recipient to claim the entitlement", async () => {
      await entitlement.fundEntitlement();
      await expect(
        entitlement.claim()
      ).to.be.revertedWith("Only the recipeient can claim funds");
    });

    it("Should only allow claming if entitlement is active", async () => {
      await expect(
        entitlement.connect(recipient).claim()
      ).to.be.revertedWith("Entitlement is not active");
    });

    it("Should set entitlement status to completed", async () => {
      await entitlement.fundEntitlement();
      await network.provider.send("evm_increaseTime", [period * secondsPerDay]);
      await entitlement.connect(recipient).claim();
      expect(await entitlement.status()).to.equal(2);
    }); 
  });

  describe("Terminating entitlement", () => {
    it("Should split token balances if not fully vested", async () => {
      await entitlement.fundEntitlement();
      await network.provider.send("evm_increaseTime", [(period / 5) * secondsPerDay]);
      await entitlement.terminate();
      expect(await testToken.balanceOf(recipient.address)).to.equal(amount / 5);
      expect(await testToken.balanceOf(owner.address)).to.equal(tokenSupply - amount / 5);
    });
    
    it("Should give recipent full balance if vested", async () => {
      await entitlement.fundEntitlement();
      await network.provider.send("evm_increaseTime", [period * secondsPerDay]);
      await entitlement.terminate();
      expect(await testToken.balanceOf(recipient.address)).to.equal(amount);
    });

    it("Should only allow the owner to terminate the entitlement", async () => {
      await entitlement.fundEntitlement();
      await expect(
        entitlement.connect(recipient).terminate()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should only allow termination if entitlement is active", async () => {
      await expect(
        entitlement.terminate()
      ).to.be.revertedWith("Entitlement is not active");
    });

    it("Should set entitlement status to completed", async () => {
      await entitlement.fundEntitlement();
      await entitlement.terminate();
      expect(await entitlement.status()).to.equal(2);
    }); 
  });

  describe("Accelerating payout", () => {
    it("Should allow the owner can accelerate the entitlement", async () => {
      await entitlement.fundEntitlement();
      await entitlement.accelerate();
      expect(await entitlement.periodInDays()).to.equal(0);
    });

    it("Should not allow non-owners to accelerate the entitlement", async () => {
      await entitlement.fundEntitlement();
      await expect(
        entitlement.connect(recipient).accelerate()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should only allow acceleration if entitlement is active", async () => {
      await expect(
        entitlement.accelerate()
      ).to.be.revertedWith("Entitlement is not active");
    });
  });

});
