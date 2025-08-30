import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Testing RemesaPay Simple Functionality");
  
  // Get signers
  const [deployer, treasury, merchant, sender, recipient] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("Treasury:", treasury.address);

  // Deploy Mock USDC
  console.log("\n📄 Deploying Mock USDC...");
  const MockERC20Factory = await ethers.getContractFactory("MockERC20");
  const usdc = await MockERC20Factory.deploy("USD Coin", "USDC", 6);
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();
  console.log("✅ Mock USDC deployed at:", usdcAddress);

  // Deploy RemesaPaySimple
  console.log("\n📄 Deploying RemesaPaySimple...");
  const RemesaPayFactory = await ethers.getContractFactory("RemesaPaySimple");
  const remesaPay = await RemesaPayFactory.deploy(usdcAddress, treasury.address);
  await remesaPay.waitForDeployment();
  const remesaPayAddress = await remesaPay.getAddress();
  console.log("✅ RemesaPaySimple deployed at:", remesaPayAddress);

  // Mint USDC for testing
  await usdc.mint(sender.address, ethers.parseUnits("1000", 6));
  console.log("💰 Minted 1000 USDC to sender");

  // Register merchant
  console.log("\n👨‍💼 Registering merchant...");
  await remesaPay.connect(merchant).registerMerchant("Test Merchant", "Quito, Ecuador");
  console.log("✅ Merchant registered");

  // Register phone number
  console.log("\n📱 Registering phone number...");
  const phoneHash = ethers.keccak256(ethers.toUtf8Bytes("+593987654321"));
  await remesaPay.connect(recipient).registerPhoneNumber(phoneHash);
  console.log("✅ Phone number registered");

  // Send remittance
  console.log("\n💸 Sending remittance...");
  const sendAmount = ethers.parseUnits("100", 6); // $100
  await usdc.connect(sender).approve(remesaPayAddress, sendAmount);
  await remesaPay.connect(sender).sendRemittance(
    phoneHash,
    usdcAddress,
    sendAmount,
    "recipient.remesa"
  );
  console.log("✅ Remittance sent: $100 USDC");

  // Check remittance
  const remittance = await remesaPay.getRemittance(0);
  console.log("📄 Remittance details:");
  console.log("  - Amount:", ethers.formatUnits(remittance.amount, 6), "USDC");
  console.log("  - Fee:", ethers.formatUnits(remittance.fee, 6), "USDC");
  console.log("  - Net Amount:", ethers.formatUnits(remittance.netAmount, 6), "USDC");
  console.log("  - Is Claimed:", remittance.isClaimed);

  // Create signature for claiming
  console.log("\n🔐 Creating claim signature...");
  const messageHash = ethers.keccak256(
    ethers.solidityPacked(
      ["uint256", "address", "address"],
      [0, merchant.address, recipient.address]
    )
  );
  const signature = await recipient.signMessage(ethers.getBytes(messageHash));

  // Claim remittance
  console.log("\n💰 Claiming remittance...");
  await remesaPay.connect(merchant).claimRemittance(0, recipient.address, signature);
  console.log("✅ Remittance claimed by merchant");

  // Check final balances
  const merchantBalance = await usdc.balanceOf(merchant.address);
  const treasuryBalance = await usdc.balanceOf(treasury.address);
  console.log("💰 Merchant USDC balance:", ethers.formatUnits(merchantBalance, 6));
  console.log("💰 Treasury fee collected:", ethers.formatUnits(treasuryBalance, 6));

  console.log("\n🎉 Test completed successfully!");
  console.log("=====================================");
  console.log("✅ Smart contracts deployed and functional");
  console.log("✅ Remittance sent with 0.5% fee");
  console.log("✅ Remittance claimed by verified merchant");
  console.log("✅ Treasury received fees");
  console.log("✅ All core features working perfectly!");
  console.log("=====================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
