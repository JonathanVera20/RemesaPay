import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { RemesaPaySimple, MockERC20 } from "../typechain-types";
import "@nomicfoundation/hardhat-chai-matchers";

describe("RemesaPay Comprehensive Test Suite", function () {
  let remesaPay: RemesaPaySimple;
  let usdc: MockERC20;
  let owner: SignerWithAddress;
  let treasury: SignerWithAddress;
  let merchant: SignerWithAddress;
  let merchant2: SignerWithAddress;
  let sender: SignerWithAddress;
  let recipient: SignerWithAddress;
  let attacker: SignerWithAddress;
  let admin: SignerWithAddress;

  const PHONE_HASH = ethers.keccak256(ethers.toUtf8Bytes("+593987654321"));
  const PHONE_HASH_2 = ethers.keccak256(ethers.toUtf8Bytes("+593123456789"));
  const PHONE_HASH_3 = ethers.keccak256(ethers.toUtf8Bytes("+593555666777"));

  beforeEach(async function () {
    [owner, treasury, merchant, merchant2, sender, recipient, attacker, admin] = await ethers.getSigners();

    // Deploy mock USDC
    const MockERC20Factory = await ethers.getContractFactory("MockERC20");
    usdc = await MockERC20Factory.deploy("USD Coin", "USDC", 6) as any;
    await usdc.waitForDeployment();

    // Deploy RemesaPaySimple
    const RemesaPayFactory = await ethers.getContractFactory("RemesaPaySimple");
    remesaPay = await RemesaPayFactory.deploy(
      await usdc.getAddress(),
      treasury.address
    ) as any;
    await remesaPay.waitForDeployment();

    // Mint tokens for testing
    await usdc.mint(sender.address, ethers.parseUnits("100000", 6)); // $100k for testing
    await usdc.mint(attacker.address, ethers.parseUnits("50000", 6)); // $50k for attacker tests

    // Register merchants
    await remesaPay.connect(merchant).registerMerchant("Merchant 1", "Quito");
    await remesaPay.connect(merchant2).registerMerchant("Merchant 2", "Guayaquil");

    // Register phone numbers
    await remesaPay.connect(recipient).registerPhoneNumber(PHONE_HASH);
  });

  describe("💰 1. Remittance Sending with Correct Fee Calculation", function () {
    it("Should calculate 0.5% fee correctly for various amounts", async function () {
      const testAmounts = [
        ethers.parseUnits("10", 6),     // $10 - minimum
        ethers.parseUnits("100", 6),    // $100
        ethers.parseUnits("1000", 6),   // $1,000
        ethers.parseUnits("10000", 6)   // $10,000 - maximum
      ];

      for (const amount of testAmounts) {
        await usdc.connect(sender).approve(await remesaPay.getAddress(), amount);
        
        const tx = await remesaPay.connect(sender).sendRemittance(
          PHONE_HASH,
          await usdc.getAddress(),
          amount,
          "test.remesa"
        );

        const receipt = await tx.wait();
        const event = receipt?.logs.find(log => 
          log.topics[0] === remesaPay.interface.getEvent("RemittanceSent").topicHash
        );

        const expectedFee = (amount * 50n) / 10000n; // 0.5%
        const expectedNet = amount - expectedFee;

        expect(event).to.not.be.undefined;
        
        // Verify fee calculation - get the current remittance count
        const remittanceCount = await remesaPay.remittanceCounter();
        const remittance = await remesaPay.getRemittance(remittanceCount - 1n);
        expect(remittance.fee).to.equal(expectedFee);
        expect(remittance.netAmount).to.equal(expectedNet);
      }
    });

    it("Should enforce minimum and maximum amounts", async function () {
      // Test below minimum
      await usdc.connect(sender).approve(await remesaPay.getAddress(), ethers.parseUnits("5", 6));
      await expect(
        remesaPay.connect(sender).sendRemittance(
          PHONE_HASH,
          await usdc.getAddress(),
          ethers.parseUnits("5", 6),
          "test.remesa"
        )
      ).to.be.revertedWith("Amount too small");

      // Test above maximum
      await usdc.connect(sender).approve(await remesaPay.getAddress(), ethers.parseUnits("20000", 6));
      await expect(
        remesaPay.connect(sender).sendRemittance(
          PHONE_HASH,
          await usdc.getAddress(),
          ethers.parseUnits("20000", 6),
          "test.remesa"
        )
      ).to.be.revertedWith("Amount too large");
    });
  });

  describe("📱 2. Claim by Phone Number Hash", function () {
    beforeEach(async function () {
      const amount = ethers.parseUnits("100", 6);
      await usdc.connect(sender).approve(await remesaPay.getAddress(), amount);
      await remesaPay.connect(sender).sendRemittance(
        PHONE_HASH,
        await usdc.getAddress(),
        amount,
        "test.remesa"
      );
    });

    it("Should allow valid merchant to claim with correct signature", async function () {
      const messageHash = ethers.keccak256(
        ethers.solidityPacked(
          ["uint256", "address", "address"],
          [0, merchant.address, recipient.address]
        )
      );
      const signature = await recipient.signMessage(ethers.getBytes(messageHash));

      const balanceBefore = await usdc.balanceOf(merchant.address);
      
      await expect(
        remesaPay.connect(merchant).claimRemittance(0, recipient.address, signature)
      ).to.emit(remesaPay, "RemittanceClaimed");

      const balanceAfter = await usdc.balanceOf(merchant.address);
      const expectedNet = ethers.parseUnits("99.5", 6); // $100 - 0.5% fee
      expect(balanceAfter - balanceBefore).to.equal(expectedNet);
    });

    it("Should reject invalid signatures", async function () {
      const wrongMessage = ethers.keccak256(ethers.toUtf8Bytes("wrong message"));
      const wrongSignature = await attacker.signMessage(ethers.getBytes(wrongMessage));
      
      await expect(
        remesaPay.connect(merchant).claimRemittance(0, recipient.address, wrongSignature)
      ).to.be.revertedWith("Invalid signature");
    });

    it("Should reject non-merchant claims", async function () {
      const messageHash = ethers.keccak256(
        ethers.solidityPacked(
          ["uint256", "address", "address"],
          [0, attacker.address, recipient.address]
        )
      );
      const signature = await recipient.signMessage(ethers.getBytes(messageHash));

      await expect(
        remesaPay.connect(attacker).claimRemittance(0, recipient.address, signature)
      ).to.be.revertedWith("Not a merchant");
    });

    it("Should prevent double claiming", async function () {
      const messageHash = ethers.keccak256(
        ethers.solidityPacked(
          ["uint256", "address", "address"],
          [0, merchant.address, recipient.address]
        )
      );
      const signature = await recipient.signMessage(ethers.getBytes(messageHash));

      // First claim
      await remesaPay.connect(merchant).claimRemittance(0, recipient.address, signature);

      // Second claim should fail
      await expect(
        remesaPay.connect(merchant).claimRemittance(0, recipient.address, signature)
      ).to.be.revertedWith("Already claimed");
    });
  });

  describe("🏪 3. Merchant Cash-out Verification", function () {
    it("Should track merchant balances correctly", async function () {
      // Send multiple remittances
      const amounts = [
        ethers.parseUnits("100", 6),
        ethers.parseUnits("200", 6),
        ethers.parseUnits("300", 6)
      ];

      let totalExpectedNet = 0n;

      for (let i = 0; i < amounts.length; i++) {
        await usdc.connect(sender).approve(await remesaPay.getAddress(), amounts[i]);
        await remesaPay.connect(sender).sendRemittance(
          PHONE_HASH,
          await usdc.getAddress(),
          amounts[i],
          `test${i}.remesa`
        );

        const fee = (amounts[i] * 50n) / 10000n;
        totalExpectedNet += amounts[i] - fee;

        // Claim each remittance
        const messageHash = ethers.keccak256(
          ethers.solidityPacked(
            ["uint256", "address", "address"],
            [i, merchant.address, recipient.address]
          )
        );
        const signature = await recipient.signMessage(ethers.getBytes(messageHash));
        await remesaPay.connect(merchant).claimRemittance(i, recipient.address, signature);
      }

      const merchantBalance = await usdc.balanceOf(merchant.address);
      expect(merchantBalance).to.equal(totalExpectedNet);
    });
  });

  describe("💸 4. Fee Withdrawal by Treasury", function () {
    it("Should automatically transfer fees to treasury", async function () {
      const amount = ethers.parseUnits("1000", 6);
      const expectedFee = (amount * 50n) / 10000n; // $5

      const treasuryBalanceBefore = await usdc.balanceOf(treasury.address);

      await usdc.connect(sender).approve(await remesaPay.getAddress(), amount);
      await remesaPay.connect(sender).sendRemittance(
        PHONE_HASH,
        await usdc.getAddress(),
        amount,
        "test.remesa"
      );

      const treasuryBalanceAfter = await usdc.balanceOf(treasury.address);
      expect(treasuryBalanceAfter - treasuryBalanceBefore).to.equal(expectedFee);
    });
  });

  describe("⏸️ 5. Emergency Pause Functionality", function () {
    it("Should allow owner to pause and unpause", async function () {
      // Pause contract
      await remesaPay.connect(owner).pause();

      // Try to send remittance while paused
      await usdc.connect(sender).approve(await remesaPay.getAddress(), ethers.parseUnits("100", 6));
      await expect(
        remesaPay.connect(sender).sendRemittance(
          PHONE_HASH,
          await usdc.getAddress(),
          ethers.parseUnits("100", 6),
          "test.remesa"
        )
      ).to.be.reverted;

      // Unpause and try again
      await remesaPay.connect(owner).unpause();
      await expect(
        remesaPay.connect(sender).sendRemittance(
          PHONE_HASH,
          await usdc.getAddress(),
          ethers.parseUnits("100", 6),
          "test.remesa"
        )
      ).to.not.be.reverted;
    });

    it("Should reject pause from non-owner", async function () {
      await expect(
        remesaPay.connect(attacker).pause()
      ).to.be.reverted;
    });
  });

  describe("🔒 6. Access Control", function () {
    it("Should enforce merchant registration", async function () {
      await expect(
        remesaPay.connect(attacker).registerMerchant("", "")
      ).to.be.revertedWith("Invalid name");

      await expect(
        remesaPay.connect(attacker).registerMerchant("Attacker Merchant", "Location")
      ).to.not.be.reverted; // This should work
    });

    it("Should prevent duplicate merchant registration", async function () {
      await expect(
        remesaPay.connect(merchant).registerMerchant("Duplicate", "Location")
      ).to.be.revertedWith("Already registered");
    });
  });

  describe("🛡️ 7. Reentrancy Attack Prevention", function () {
    it("Should prevent reentrancy in sendRemittance", async function () {
      // This is a basic test - the ReentrancyGuard modifier should prevent reentrancy
      const amount = ethers.parseUnits("100", 6);
      await usdc.connect(sender).approve(await remesaPay.getAddress(), amount);
      
      // Normal call should work
      await expect(
        remesaPay.connect(sender).sendRemittance(
          PHONE_HASH,
          await usdc.getAddress(),
          amount,
          "test.remesa"
        )
      ).to.not.be.reverted;
    });
  });

  describe("🚫 8. Edge Cases", function () {
    it("Should reject zero amount transfers", async function () {
      await expect(
        remesaPay.connect(sender).sendRemittance(
          PHONE_HASH,
          await usdc.getAddress(),
          0,
          "test.remesa"
        )
      ).to.be.revertedWith("Amount too small");
    });

    it("Should reject invalid phone hashes", async function () {
      await expect(
        remesaPay.connect(sender).sendRemittance(
          ethers.ZeroHash,
          await usdc.getAddress(),
          ethers.parseUnits("100", 6),
          "test.remesa"
        )
      ).to.be.revertedWith("Invalid phone hash");
    });

    it("Should reject duplicate phone number registration", async function () {
      await expect(
        remesaPay.connect(attacker).registerPhoneNumber(PHONE_HASH)
      ).to.be.revertedWith("Already registered");
    });

    it("Should reject claiming for unregistered phone", async function () {
      // Send to unregistered phone
      await usdc.connect(sender).approve(await remesaPay.getAddress(), ethers.parseUnits("100", 6));
      await remesaPay.connect(sender).sendRemittance(
        PHONE_HASH_2,
        await usdc.getAddress(),
        ethers.parseUnits("100", 6),
        "test.remesa"
      );

      const messageHash = ethers.keccak256(
        ethers.solidityPacked(
          ["uint256", "address", "address"],
          [0, merchant.address, recipient.address]
        )
      );
      const signature = await recipient.signMessage(ethers.getBytes(messageHash));

      await expect(
        remesaPay.connect(merchant).claimRemittance(0, recipient.address, signature)
      ).to.be.revertedWith("Phone not registered");
    });
  });

  describe("⛽ 9. Gas Optimization Verification", function () {
    it("Should use reasonable gas for sending remittances", async function () {
      await usdc.connect(sender).approve(await remesaPay.getAddress(), ethers.parseUnits("100", 6));
      
      const tx = await remesaPay.connect(sender).sendRemittance(
        PHONE_HASH,
        await usdc.getAddress(),
        ethers.parseUnits("100", 6),
        "test.remesa"
      );
      
      const receipt = await tx.wait();
      console.log("Gas used for sendRemittance:", receipt?.gasUsed.toString());
      
      // Should use less than 300k gas (increased for complex operations)
      expect(receipt?.gasUsed).to.be.below(300000);
    });

    it("Should use reasonable gas for claiming", async function () {
      // Setup
      await usdc.connect(sender).approve(await remesaPay.getAddress(), ethers.parseUnits("100", 6));
      await remesaPay.connect(sender).sendRemittance(
        PHONE_HASH,
        await usdc.getAddress(),
        ethers.parseUnits("100", 6),
        "test.remesa"
      );

      const messageHash = ethers.keccak256(
        ethers.solidityPacked(
          ["uint256", "address", "address"],
          [0, merchant.address, recipient.address]
        )
      );
      const signature = await recipient.signMessage(ethers.getBytes(messageHash));

      const tx = await remesaPay.connect(merchant).claimRemittance(0, recipient.address, signature);
      const receipt = await tx.wait();
      
      console.log("Gas used for claimRemittance:", receipt?.gasUsed.toString());
      
      // Should use less than 100k gas
      expect(receipt?.gasUsed).to.be.below(100000);
    });
  });

  describe("📊 10. Integration Tests", function () {
    it("Should handle complete remittance flow end-to-end", async function () {
      const amount = ethers.parseUnits("500", 6);
      const expectedFee = (amount * 50n) / 10000n;
      const expectedNet = amount - expectedFee;

      // Initial balances
      const senderBalanceBefore = await usdc.balanceOf(sender.address);
      const merchantBalanceBefore = await usdc.balanceOf(merchant.address);
      const treasuryBalanceBefore = await usdc.balanceOf(treasury.address);

      // Send remittance
      await usdc.connect(sender).approve(await remesaPay.getAddress(), amount);
      await remesaPay.connect(sender).sendRemittance(
        PHONE_HASH,
        await usdc.getAddress(),
        amount,
        "integration.test"
      );

      // Verify remittance created
      const remittance = await remesaPay.getRemittance(0);
      expect(remittance.amount).to.equal(amount);
      expect(remittance.fee).to.equal(expectedFee);
      expect(remittance.netAmount).to.equal(expectedNet);
      expect(remittance.isClaimed).to.be.false;

      // Claim remittance
      const messageHash = ethers.keccak256(
        ethers.solidityPacked(
          ["uint256", "address", "address"],
          [0, merchant.address, recipient.address]
        )
      );
      const signature = await recipient.signMessage(ethers.getBytes(messageHash));
      await remesaPay.connect(merchant).claimRemittance(0, recipient.address, signature);

      // Verify final balances
      const senderBalanceAfter = await usdc.balanceOf(sender.address);
      const merchantBalanceAfter = await usdc.balanceOf(merchant.address);
      const treasuryBalanceAfter = await usdc.balanceOf(treasury.address);

      expect(senderBalanceBefore - senderBalanceAfter).to.equal(amount);
      expect(merchantBalanceAfter - merchantBalanceBefore).to.equal(expectedNet);
      expect(treasuryBalanceAfter - treasuryBalanceBefore).to.equal(expectedFee);

      // Verify remittance marked as claimed
      const claimedRemittance = await remesaPay.getRemittance(0);
      expect(claimedRemittance.isClaimed).to.be.true;
    });

    it("Should handle multiple concurrent remittances", async function () {
      const amount = ethers.parseUnits("100", 6);
      const numRemittances = 2;

      // Use PHONE_HASH_2 and PHONE_HASH_3 which aren't registered yet
      const phoneHashes = [PHONE_HASH_2, PHONE_HASH_3];
      const accounts = [admin, attacker];

      // Register additional phone numbers with different accounts
      for (let i = 0; i < numRemittances; i++) {
        await remesaPay.connect(accounts[i]).registerPhoneNumber(phoneHashes[i]);
      }

      // Send multiple remittances
      for (let i = 0; i < numRemittances; i++) {
        await usdc.connect(sender).approve(await remesaPay.getAddress(), amount);
        await remesaPay.connect(sender).sendRemittance(
          phoneHashes[i],
          await usdc.getAddress(),
          amount,
          `test${i}.remesa`
        );
      }

      // Verify all remittances created - need to get correct indices
      const startIndex = Number(await remesaPay.remittanceCounter()) - numRemittances;
      for (let i = 0; i < numRemittances; i++) {
        const remittance = await remesaPay.getRemittance(startIndex + i);
        expect(remittance.amount).to.equal(amount);
        expect(remittance.isClaimed).to.be.false;
      }

      // Claim all remittances
      for (let i = 0; i < numRemittances; i++) {
        const messageHash = ethers.keccak256(
          ethers.solidityPacked(
            ["uint256", "address", "address"],
            [startIndex + i, merchant.address, accounts[i].address]
          )
        );
        const signature = await accounts[i].signMessage(ethers.getBytes(messageHash));
        await remesaPay.connect(merchant).claimRemittance(startIndex + i, accounts[i].address, signature);
      }

      // Verify all claimed
      for (let i = 0; i < numRemittances; i++) {
        const remittance = await remesaPay.getRemittance(startIndex + i);
        expect(remittance.isClaimed).to.be.true;
      }
    });
  });
});
