import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Savings", function () {
  async function deploySavingsContractFixture() {
    const [owner, otherAccount] = await ethers.getSigners();
    const Savings = await ethers.getContractFactory("Savings");
    const { deposit, withdraw, checkSavings, sendOutSaving, checkContractBal } =
      await Savings.deploy();
    return {
      deposit,
      withdraw,
      checkSavings,
      sendOutSaving,
      checkContractBal,
      owner,
      otherAccount,
    };
  }

  describe("deposit, withdraw, checkSavings, sendOutSaving, and checkContractBal", function () {
    it("Should be able to deposit", async function () {
      const { deposit, checkContractBal } = await loadFixture(
        deploySavingsContractFixture
      );
      // Send 1 ETH
      await deposit({ value: ethers.parseEther("1") });
      const balance = await checkContractBal();
      expect(balance).to.equal(1000000000000000000n);
    });

    it("Should revert when trying to deposit zero value", async function () {
      const { deposit } = await loadFixture(deploySavingsContractFixture);

      // Try to deposit zero ETH
      await expect(
        deposit({
          value: 0,
        })
      ).to.be.revertedWith("can't save zero value");
    });

    it("Should be able to withdraw", async function () {
      const { deposit, withdraw, checkContractBal } = await loadFixture(
        deploySavingsContractFixture
      );
      // Send 1 ETH
      await deposit({ value: ethers.parseEther("1") });
      const balance = await withdraw();
      expect(balance.value).to.be.equal(0);
    });

    it("Amount should be greater than zero", async function () {
      const { withdraw } = await loadFixture(deploySavingsContractFixture);
      await expect(withdraw()).to.be.rejectedWith("you don't have any savings");
    });

    // send out savings and checkbal of the receiver
    it("Shoukd send-out prefered amount to reciever's and check reciever account balance to check if it was recieved", async function () {
      const { sendOutSaving, otherAccount, deposit, owner } = await loadFixture(
        deploySavingsContractFixture
      );

      // Send 1 ETH
      await deposit({ value: ethers.parseEther("100") });

      const initialSenderBalance = await ethers.provider.getBalance(
        owner.address
      );
      const initialReceiverBalance = await ethers.provider.getBalance(
        otherAccount.address
      );

      await sendOutSaving(otherAccount.address, ethers.parseEther("1"));

      const updatedSenderBalance = await ethers.provider.getBalance(
        owner.address
      );
      const updatedReceiverBalance = await ethers.provider.getBalance(
        otherAccount.address
      );

      expect(updatedSenderBalance).to.be.lt(initialSenderBalance);
      expect(updatedReceiverBalance).to.be.gt(initialReceiverBalance);
    });
  });
});
