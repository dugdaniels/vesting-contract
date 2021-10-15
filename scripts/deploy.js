// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const TestToken = await hre.ethers.getContractFactory("TestToken");
  const testToken = await TestToken.deploy("Test Token", "T_T", 1_000_000);
  console.log(await.testToken)

  await testToken.deployed();

  const Entitlement = await hre.ethers.getContractFactory("Entitlement");
  const entitlement = await Greeter.deploy("Hello, Hardhat!");

  await entitlement.deployed();

  console.log("Entitlement deployed to:", greeter.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
