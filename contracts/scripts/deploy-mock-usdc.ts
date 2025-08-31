import { ethers, network } from "hardhat";

async function main() {
  console.log(`\n🪙 Deploying MockUSDC to ${network.name}...`);
  
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");

  // Deploy MockUSDC
  console.log("\n📦 Deploying MockUSDC...");
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy();
  await mockUSDC.waitForDeployment();
  
  const mockUSDCAddress = await mockUSDC.getAddress();
  console.log("✅ MockUSDC deployed to:", mockUSDCAddress);

  // Mint some initial tokens to deployer
  console.log("\n💰 Minting initial tokens...");
  const mintTx = await mockUSDC.faucet();
  await mintTx.wait();
  
  const balance = await mockUSDC.balanceOf(deployer.address);
  console.log("✅ Minted", ethers.formatUnits(balance, 6), "USDC to deployer");

  // Display useful information
  console.log("\n📋 Contract Information:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📍 MockUSDC Address:", mockUSDCAddress);
  console.log("🌐 Network:", network.name);
  console.log("🔗 Add to MetaMask:");
  console.log("   - Contract Address:", mockUSDCAddress);
  console.log("   - Symbol: USDC");
  console.log("   - Decimals: 6");
  console.log("\n🎉 How to use:");
  console.log("1. Add this token to your MetaMask");
  console.log("2. Call faucet() function to get 1000 USDC");
  console.log("3. Use mintToSelf(amount) to mint specific amounts");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  return mockUSDCAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
