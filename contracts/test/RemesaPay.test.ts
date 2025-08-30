import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { RemesaPay, MockERC20 } from "../typechain-types";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import "@nomicfoundation/hardhat-chai-matchers";

describe("RemesaPay", function () {
  let remesaPay: RemesaPay;
  let usdc: MockERC20;
  let usdt: MockERC20;
  let owner: SignerWithAddress;
  let treasury: SignerWithAddress;
  let merchant: SignerWithAddress;
  let sender: SignerWithAddress;
  let recipient: SignerWithAddress;
  let user2: SignerWithAddress;

  const PHONE_HASH = ethers.keccak256(ethers.toUtf8Bytes("+593987654321"));
  const PHONE_HASH_2 = ethers.keccak256(ethers.toUtf8Bytes("+593123456789"));
  const SEND_AMOUNT = ethers.parseUnits("100", 6); // $100 USDC
  const PROTOCOL_FEE_BASIS_POINTS = 50; // 0.5%
  const BASIS_POINTS_DENOMINATOR = 10000;

  beforeEach(async function () {
    [owner, treasury, merchant, sender, recipient, user2] = await ethers.getSigners();

    // Deploy mock tokens
    const MockERC20Factory = await ethers.getContractFactory("MockERC20");
    usdc = await MockERC20Factory.deploy("USD Coin", "USDC", 6) as unknown as MockERC20;
    usdt = await MockERC20Factory.deploy("Tether USD", "USDT", 6) as unknown as MockERC20;
    await usdc.waitForDeployment();
    await usdt.waitForDeployment();

    // Deploy RemesaPay
    const RemesaPayFactory = await ethers.getContractFactory("RemesaPay");
    remesaPay = await upgrades.deployProxy(
      RemesaPayFactory,
      [treasury.address, owner.address, await usdc.getAddress(), await usdt.getAddress()],
      { initializer: "initialize", kind: "uups" }
    ) as unknown as RemesaPay;
    await remesaPay.waitForDeployment();

    // Mint tokens for testing
    await usdc.mint(sender.address, ethers.parseUnits("10000", 6));
    await usdt.mint(sender.address, ethers.parseUnits("10000", 6));
    
    // Approve contract to spend tokens
    await usdc.connect(sender).approve(await remesaPay.getAddress(), ethers.parseUnits("10000", 6));
    await usdt.connect(sender).approve(await remesaPay.getAddress(), ethers.parseUnits("10000", 6));
  });

  describe("Initialization", function () {
    it("Should initialize correctly", async function () {
      expect(await remesaPay.treasury()).to.equal(treasury.address);
      expect(await remesaPay.supportedTokens(await usdc.getAddress())).to.be.true;
      expect(await remesaPay.supportedTokens(await usdt.getAddress())).to.be.true;
      expect(await remesaPay.hasRole(await remesaPay.ADMIN_ROLE(), owner.address)).to.be.true;
    });

    it("Should not allow initialization twice", async function () {
      await expect(
        remesaPay.initialize(treasury.address, owner.address, await usdc.getAddress(), await usdt.getAddress())
      ).to.be.revertedWith("Initializable: contract is already initialized");
    });
  });

  describe("Phone Number Registration", function () {
    it("Should register phone number successfully", async function () {
      await expect(remesaPay.connect(recipient).registerPhoneNumber(PHONE_HASH))
        .to.emit(remesaPay, "PhoneNumberRegistered")
        .withArgs(PHONE_HASH, recipient.address);

      expect(await remesaPay.phoneToAddress(PHONE_HASH)).to.equal(recipient.address);
      expect(await remesaPay.isPhoneRegistered(PHONE_HASH)).to.be.true;
    });

    it("Should not allow duplicate phone registration", async function () {
      await remesaPay.connect(recipient).registerPhoneNumber(PHONE_HASH);
      
      await expect(
        remesaPay.connect(user2).registerPhoneNumber(PHONE_HASH)
      ).to.be.revertedWith("Phone already registered");
    });

    it("Should not allow invalid phone hash", async function () {
      await expect(
        remesaPay.connect(recipient).registerPhoneNumber(ethers.ZeroHash)
      ).to.be.revertedWith("Invalid phone hash");
    });
  });

  describe("ENS Subdomain Registration", function () {
    it("Should register ENS subdomain successfully", async function () {
      const subdomain = "testuser";
      
      await expect(remesaPay.connect(recipient).registerENSSubdomain(subdomain))
        .to.emit(remesaPay, "ENSSubdomainRegistered")
        .withArgs(subdomain, recipient.address);

      expect(await remesaPay.ensSubdomainToAddress(subdomain)).to.equal(recipient.address);
      expect(await remesaPay.isENSSubdomainAvailable(subdomain)).to.be.false;
    });

    it("Should not allow duplicate subdomain registration", async function () {
      const subdomain = "testuser";
      await remesaPay.connect(recipient).registerENSSubdomain(subdomain);
      
      await expect(
        remesaPay.connect(user2).registerENSSubdomain(subdomain)
      ).to.be.revertedWith("Subdomain taken");
    });
  });

  describe("Merchant Registration", function () {
    it("Should register merchant successfully", async function () {
      const merchantName = "Test Merchant";
      const location = "Quito, Ecuador";
      
      await expect(
        remesaPay.connect(merchant).registerMerchant(merchantName, location, merchant.address)
      )
        .to.emit(remesaPay, "MerchantRegistered")
        .withArgs(merchant.address, merchantName, location);

      const merchantData = await remesaPay.getMerchant(merchant.address);
      expect(merchantData.isActive).to.be.true;
      expect(merchantData.name).to.equal(merchantName);
      expect(merchantData.location).to.equal(location);
      expect(await remesaPay.hasRole(await remesaPay.MERCHANT_ROLE(), merchant.address)).to.be.true;
    });

    it("Should not allow duplicate merchant registration", async function () {
      await remesaPay.connect(merchant).registerMerchant("Test", "Location", merchant.address);
      
      await expect(
        remesaPay.connect(merchant).registerMerchant("Test2", "Location2", merchant.address)
      ).to.be.revertedWith("Already registered");
    });
  });

  describe("Sending Remittances", function () {
    beforeEach(async function () {
      await remesaPay.connect(recipient).registerPhoneNumber(PHONE_HASH);
    });

    it("Should send remittance successfully", async function () {
      const expectedFee = (SEND_AMOUNT * BigInt(PROTOCOL_FEE_BASIS_POINTS)) / BigInt(BASIS_POINTS_DENOMINATOR);
      const expectedNetAmount = SEND_AMOUNT - expectedFee;

      await expect(
        remesaPay.connect(sender).sendRemittance(PHONE_HASH, await usdc.getAddress(), SEND_AMOUNT, "testuser")
      )
        .to.emit(remesaPay, "RemittanceSent")
        .withArgs(0, sender.address, PHONE_HASH, await usdc.getAddress(), SEND_AMOUNT, expectedFee, "testuser");

      const remittance = await remesaPay.getRemittance(0);
      expect(remittance.sender).to.equal(sender.address);
      expect(remittance.phoneHash).to.equal(PHONE_HASH);
      expect(remittance.amount).to.equal(SEND_AMOUNT);
      expect(remittance.fee).to.equal(expectedFee);
      expect(remittance.netAmount).to.equal(expectedNetAmount);
      expect(remittance.isClaimed).to.be.false;

      // Check balances
      expect(await usdc.balanceOf(treasury.address)).to.equal(expectedFee);
      expect(await usdc.balanceOf(await remesaPay.getAddress())).to.equal(expectedNetAmount);
    });

    it("Should enforce minimum amount", async function () {
      const tooSmall = ethers.parseUnits("5", 6); // $5, below $10 minimum
      
      await expect(
        remesaPay.connect(sender).sendRemittance(PHONE_HASH, await usdc.getAddress(), tooSmall, "")
      ).to.be.revertedWith("Amount too small");
    });

    it("Should enforce maximum amount", async function () {
      const tooLarge = ethers.parseUnits("15000", 6); // $15,000, above $10,000 maximum
      
      await expect(
        remesaPay.connect(sender).sendRemittance(PHONE_HASH, await usdc.getAddress(), tooLarge, "")
      ).to.be.revertedWith("Amount too large");
    });

    it("Should enforce daily limits", async function () {
      const dailyLimit = ethers.parseUnits("50000", 6); // $50,000 daily limit
      const amount1 = ethers.parseUnits("30000", 6);
      const amount2 = ethers.parseUnits("25000", 6); // Total would exceed limit

      // Mint more tokens for large amounts
      await usdc.mint(sender.address, ethers.parseUnits("60000", 6));
      await usdc.connect(sender).approve(await remesaPay.getAddress(), ethers.parseUnits("60000", 6));

      // First transaction should succeed
      await remesaPay.connect(sender).sendRemittance(PHONE_HASH, await usdc.getAddress(), amount1, "");

      // Second transaction should fail
      await expect(
        remesaPay.connect(sender).sendRemittance(PHONE_HASH_2, await usdc.getAddress(), amount2, "")
      ).to.be.revertedWith("Daily limit exceeded");
    });

    it("Should handle large amounts with time lock", async function () {
      const largeAmount = ethers.parseUnits("1500", 6); // $1,500, above $1,000 threshold
      
      await usdc.mint(sender.address, largeAmount);
      await usdc.connect(sender).approve(await remesaPay.getAddress(), largeAmount);

      await remesaPay.connect(sender).sendRemittance(PHONE_HASH, await usdc.getAddress(), largeAmount, "");

      const remittance = await remesaPay.getRemittance(0);
      expect(remittance.isLargeAmount).to.be.true;
      expect(remittance.unlockTime).to.be.gt(remittance.timestamp);
    });

    it("Should not allow unsupported tokens", async function () {
      const MockERC20Factory = await ethers.getContractFactory("MockERC20");
      const unsupportedToken = await MockERC20Factory.deploy("Unsupported", "UNSUP", 18);
      
      await expect(
        remesaPay.connect(sender).sendRemittance(PHONE_HASH, await unsupportedToken.getAddress(), SEND_AMOUNT, "")
      ).to.be.revertedWith("Token not supported");
    });
  });

  describe("Claiming Remittances", function () {
    let remittanceId: number;
    let expectedNetAmount: bigint;

    beforeEach(async function () {
      // Register phone and merchant
      await remesaPay.connect(recipient).registerPhoneNumber(PHONE_HASH);
      await remesaPay.connect(merchant).registerMerchant("Test Merchant", "Quito", merchant.address);

      // Send remittance
      await remesaPay.connect(sender).sendRemittance(PHONE_HASH, await usdc.getAddress(), SEND_AMOUNT, "");
      
      remittanceId = 0;
      const expectedFee = (SEND_AMOUNT * BigInt(PROTOCOL_FEE_BASIS_POINTS)) / BigInt(BASIS_POINTS_DENOMINATOR);
      expectedNetAmount = SEND_AMOUNT - expectedFee;
    });

    it("Should claim remittance successfully", async function () {
      // Create signature
      const messageHash = ethers.keccak256(
        ethers.solidityPacked(
          ["uint256", "address", "address"],
          [remittanceId, merchant.address, recipient.address]
        )
      );
      
      const signature = await recipient.signMessage(ethers.getBytes(messageHash));

      await expect(
        remesaPay.connect(merchant).claimRemittance(remittanceId, recipient.address, signature)
      )
        .to.emit(remesaPay, "RemittanceClaimed")
        .withArgs(remittanceId, recipient.address, merchant.address, expectedNetAmount);

      const remittance = await remesaPay.getRemittance(remittanceId);
      expect(remittance.isClaimed).to.be.true;
      
      expect(await usdc.balanceOf(merchant.address)).to.equal(expectedNetAmount);
    });

    it("Should not allow non-merchants to claim", async function () {
      const messageHash = ethers.keccak256(
        ethers.solidityPacked(
          ["uint256", "address", "address"],
          [remittanceId, user2.address, recipient.address]
        )
      );
      
      const signature = await recipient.signMessage(ethers.getBytes(messageHash));

      await expect(
        remesaPay.connect(user2).claimRemittance(remittanceId, recipient.address, signature)
      ).to.be.revertedWith("Not active merchant");
    });

    it("Should not allow claiming with invalid signature", async function () {
      const wrongMessageHash = ethers.keccak256(
        ethers.solidityPacked(
          ["uint256", "address", "address"],
          [999, merchant.address, recipient.address] // Wrong remittance ID
        )
      );
      
      const signature = await recipient.signMessage(ethers.getBytes(wrongMessageHash));

      await expect(
        remesaPay.connect(merchant).claimRemittance(remittanceId, recipient.address, signature)
      ).to.be.revertedWith("Invalid signature");
    });

    it("Should not allow double claiming", async function () {
      const messageHash = ethers.keccak256(
        ethers.solidityPacked(
          ["uint256", "address", "address"],
          [remittanceId, merchant.address, recipient.address]
        )
      );
      
      const signature = await recipient.signMessage(ethers.getBytes(messageHash));

      // First claim
      await remesaPay.connect(merchant).claimRemittance(remittanceId, recipient.address, signature);

      // Second claim should fail
      await expect(
        remesaPay.connect(merchant).claimRemittance(remittanceId, recipient.address, signature)
      ).to.be.revertedWith("Already claimed");
    });

    it("Should respect time locks for large amounts", async function () {
      // Send large amount
      const largeAmount = ethers.parseUnits("1500", 6);
      await usdc.mint(sender.address, largeAmount);
      await usdc.connect(sender).approve(await remesaPay.getAddress(), largeAmount);
      await remesaPay.connect(sender).sendRemittance(PHONE_HASH_2, await usdc.getAddress(), largeAmount, "");

      const largeRemittanceId = 1;
      const messageHash = ethers.keccak256(
        ethers.solidityPacked(
          ["uint256", "address", "address"],
          [largeRemittanceId, merchant.address, recipient.address]
        )
      );
      
      const signature = await recipient.signMessage(ethers.getBytes(messageHash));

      // Should fail before time lock expires
      await expect(
        remesaPay.connect(merchant).claimRemittance(largeRemittanceId, recipient.address, signature)
      ).to.be.revertedWith("Still time-locked");

      // Fast forward time
      await time.increase(24 * 60 * 60 + 1); // 24 hours + 1 second

      // Should succeed after time lock expires
      // Note: Need to register second phone hash first
      await remesaPay.connect(recipient).registerPhoneNumber(PHONE_HASH_2);
      
      await expect(
        remesaPay.connect(merchant).claimRemittance(largeRemittanceId, recipient.address, signature)
      ).to.emit(remesaPay, "RemittanceClaimed");
    });
  });

  describe("Batch Operations", function () {
    beforeEach(async function () {
      await remesaPay.connect(recipient).registerPhoneNumber(PHONE_HASH);
      await remesaPay.connect(recipient).registerPhoneNumber(PHONE_HASH_2);
      
      // Mint more tokens for batch operations
      await usdc.mint(sender.address, ethers.parseUnits("1000", 6));
      await usdc.connect(sender).approve(await remesaPay.getAddress(), ethers.parseUnits("1000", 6));
    });

    it("Should handle batch remittances", async function () {
      const usdcAddress = await usdc.getAddress();
      const batchData = [
        {
          phoneHash: PHONE_HASH,
          token: usdcAddress,
          amount: ethers.parseUnits("100", 6),
          ensSubdomain: "user1"
        },
        {
          phoneHash: PHONE_HASH_2,
          token: usdcAddress,
          amount: ethers.parseUnits("200", 6),
          ensSubdomain: "user2"
        }
      ];

      await expect(
        remesaPay.connect(sender).batchSendRemittances(batchData)
      ).to.emit(remesaPay, "RemittanceSent");

      // Check that both remittances were created
      const remittance1 = await remesaPay.getRemittance(0);
      const remittance2 = await remesaPay.getRemittance(1);
      
      expect(remittance1.amount).to.equal(ethers.parseUnits("100", 6));
      expect(remittance2.amount).to.equal(ethers.parseUnits("200", 6));
    });

    it("Should enforce batch size limits", async function () {
      const usdcAddress = await usdc.getAddress();
      const largeBatch = Array(51).fill(0).map((_, i) => ({
        phoneHash: PHONE_HASH,
        token: usdcAddress,
        amount: ethers.parseUnits("10", 6),
        ensSubdomain: `user${i}`
      }));

      await expect(
        remesaPay.connect(sender).batchSendRemittances(largeBatch)
      ).to.be.revertedWith("Batch too large");
    });
  });

  describe("Admin Functions", function () {
    it("Should allow admin to update treasury", async function () {
      const newTreasury = user2.address;
      
      await expect(remesaPay.connect(owner).updateTreasury(newTreasury))
        .to.emit(remesaPay, "TreasuryUpdated")
        .withArgs(treasury.address, newTreasury);

      expect(await remesaPay.treasury()).to.equal(newTreasury);
    });

    it("Should allow admin to update token support", async function () {
      const MockERC20Factory = await ethers.getContractFactory("MockERC20");
      const newToken = await MockERC20Factory.deploy("New Token", "NEW", 18);
      
      await expect(remesaPay.connect(owner).updateTokenSupport(await newToken.getAddress(), true))
        .to.emit(remesaPay, "TokenSupportUpdated")
        .withArgs(await newToken.getAddress(), true);

      expect(await remesaPay.supportedTokens(await newToken.getAddress())).to.be.true;
    });

    it("Should allow admin to blacklist users", async function () {
      await expect(remesaPay.connect(owner).updateUserBlacklist(sender.address, true))
        .to.emit(remesaPay, "UserBlacklisted")
        .withArgs(sender.address, true);

      const userStats = await remesaPay.getUserStats(sender.address);
      expect(userStats.isBlacklisted).to.be.true;

      // Blacklisted user should not be able to send remittances
      await expect(
        remesaPay.connect(sender).sendRemittance(PHONE_HASH, await usdc.getAddress(), SEND_AMOUNT, "")
      ).to.be.revertedWith("Sender blacklisted");
    });

    it("Should not allow non-admin to perform admin functions", async function () {
      await expect(
        remesaPay.connect(user2).updateTreasury(user2.address)
      ).to.be.revertedWith(`AccessControl: account ${user2.address.toLowerCase()} is missing role ${await remesaPay.ADMIN_ROLE()}`);
    });
  });

  describe("Pause Functionality", function () {
    it("Should allow pauser to pause contract", async function () {
      await remesaPay.connect(owner).pause();
      expect(await remesaPay.paused()).to.be.true;

      await expect(
        remesaPay.connect(sender).sendRemittance(PHONE_HASH, await usdc.getAddress(), SEND_AMOUNT, "")
      ).to.be.revertedWith("Pausable: paused");
    });

    it("Should allow emergency withdrawal when paused", async function () {
      // First send a remittance to have tokens in contract
      await remesaPay.connect(recipient).registerPhoneNumber(PHONE_HASH);
      await remesaPay.connect(sender).sendRemittance(PHONE_HASH, await usdc.getAddress(), SEND_AMOUNT, "");

      const contractBalance = await usdc.balanceOf(await remesaPay.getAddress());
      expect(contractBalance).to.be.gt(0);

      // Pause contract
      await remesaPay.connect(owner).pause();

      // Emergency withdrawal
      const treasuryBalanceBefore = await usdc.balanceOf(treasury.address);
      await remesaPay.connect(owner).emergencyWithdraw(await usdc.getAddress(), contractBalance);
      const treasuryBalanceAfter = await usdc.balanceOf(treasury.address);

      expect(treasuryBalanceAfter - treasuryBalanceBefore).to.equal(contractBalance);
    });
  });

  describe("Upgradeability", function () {
    it("Should be upgradeable by upgrader role", async function () {
      // This test would require a new implementation contract
      // For now, we just test that the upgrade authorization works
      expect(await remesaPay.hasRole(await remesaPay.UPGRADER_ROLE(), owner.address)).to.be.true;
    });

    it("Should have correct version", async function () {
      expect(await remesaPay.version()).to.equal("1.0.0");
    });
  });
});
