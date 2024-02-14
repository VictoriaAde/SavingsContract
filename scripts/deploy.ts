import { ethers } from "hardhat";

async function main() {
  const savingsContract = await ethers.deployContract("Savings");

  await savingsContract.waitForDeployment();

  console.log(`Savings Contract deployed to ${savingsContract.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
