import { ethers, upgrades, network } from "hardhat";
import { verify } from "../utils/verify";

async function main() {
  console.log(`\n🚀 Deploying RemesaPay to ${network.name}...`);
  
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");

  // Network-specific configurations
  const networkConfigs: Record<string, any> = {
    // Base Mainnet
    base: {
      usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      usdt: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
      treasury: "0x742d35Cc0138cE8b4DD94305c2e8d93b8a06DEEf", // Replace with your treasury
      admin: "0x742d35Cc0138cE8b4DD94305c2e8d93b8a06DEEf" // Replace with your admin
    },
    // Optimism Mainnet
    optimism: {
      usdc: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
      usdt: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
      treasury: "0x742d35Cc0138cE8b4DD94305c2e8d93b8a06DEEf", // Replace with your treasury
      admin: "0x742d35Cc0138cE8b4DD94305c2e8d93b8a06DEEf" // Replace with your admin
    },
    // Base Testnet (Sepolia)
    baseTestnet: {
      usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // Official Base Sepolia USDC
      usdt: "0x0000000000000000000000000000000000000000", // No USDT on testnet
      treasury: deployer.address, // Use deployer as treasury on testnet
      admin: deployer.address // Use deployer as admin on testnet
    },
    // Optimism Testnet (Sepolia)
    optimismTestnet: {
      usdc: "0xe05606174bac4A6364B31bd0eCA4bf4dD368f8C6",
      usdt: "0x0000000000000000000000000000000000000000", // No USDT on testnet
      treasury: deployer.address, // Use deployer as treasury on testnet
      admin: deployer.address // Use deployer as admin on testnet
    },
    // Local/Hardhat
    localhost: {
      usdc: "0x0000000000000000000000000000000000000000", // Will deploy mock
      usdt: "0x0000000000000000000000000000000000000000", // Will deploy mock
      treasury: deployer.address,
      admin: deployer.address
    }
  };

  const config = networkConfigs[network.name];
  if (!config) {
    throw new Error(`Network ${network.name} not supported`);
  }

  let usdcAddress = config.usdc;
  let usdtAddress = config.usdt;

  // Deploy mock tokens for local development
  if (network.name === "localhost" || network.name === "hardhat") {
    console.log("📄 Deploying mock tokens for local development...");
    
    // Deploy Mock USDC
    const MockUSDC = await ethers.getContractFactory("MockERC20");
    const mockUSDC = await MockUSDC.deploy("USD Coin", "USDC", 6);
    await mockUSDC.waitForDeployment();
    usdcAddress = await mockUSDC.getAddress();
    console.log("🪙 Mock USDC deployed to:", usdcAddress);

    // Deploy Mock USDT
    const MockUSDT = await ethers.getContractFactory("MockERC20");
    const mockUSDT = await MockUSDT.deploy("Tether USD", "USDT", 6);
    await mockUSDT.waitForDeployment();
    usdtAddress = await mockUSDT.getAddress();
    console.log("🪙 Mock USDT deployed to:", usdtAddress);
  }

  console.log("⚙️ Configuration:");
  console.log("  USDC:", usdcAddress);
  console.log("  USDT:", usdtAddress);
  console.log("  Treasury:", config.treasury);
  console.log("  Admin:", config.admin);

  // Deploy RemesaPay with upgradeable proxy
  console.log("\n📄 Deploying RemesaPay contract...");
  const RemesaPay = await ethers.getContractFactory("RemesaPay");
  
  const remesaPay = await upgrades.deployProxy(
    RemesaPay,
    [
      config.treasury,
      config.admin,
      usdcAddress,
      usdtAddress !== "0x0000000000000000000000000000000000000000" ? usdtAddress : ethers.ZeroAddress
    ],
    {
      initializer: "initialize",
      kind: "uups"
    }
  );
  
  await remesaPay.waitForDeployment();
  const remesaPayAddress = await remesaPay.getAddress();
  
  console.log("✅ RemesaPay deployed to:", remesaPayAddress);

  // Get implementation address for verification
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(remesaPayAddress);
  console.log("🔧 Implementation address:", implementationAddress);

  // Wait for a few block confirmations before verification
  if (network.name !== "localhost" && network.name !== "hardhat") {
    console.log("\n⏳ Waiting for block confirmations...");
    await remesaPay.deploymentTransaction()?.wait(5);

    // Verify contract on Etherscan
    console.log("\n🔍 Verifying contract on Etherscan...");
    try {
      await verify(implementationAddress, []);
      console.log("✅ Contract verified successfully");
    } catch (error) {
      console.log("❌ Verification failed:", error);
    }
  }

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: network.config.chainId,
    remesaPay: remesaPayAddress,
    implementation: implementationAddress,
    usdc: usdcAddress,
    usdt: usdtAddress,
    treasury: config.treasury,
    admin: config.admin,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber()
  };

  console.log("\n📋 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Save to file
  const fs = require("fs");
  const path = require("path");
  const deploymentsDir = path.join(__dirname, "../deployments");
  
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(deploymentsDir, `${network.name}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log(`\n💾 Deployment info saved to deployments/${network.name}.json`);

  // Register initial merchant if on testnet
  if (network.name.includes("testnet") || network.name === "localhost") {
    console.log("\n👥 Registering initial test merchant...");
    try {
      const tx = await remesaPay.registerMerchant(
        "Test Merchant - Ecuador",
        "Quito, Ecuador",
        deployer.address
      );
      await tx.wait();
      console.log("✅ Test merchant registered successfully");
    } catch (error) {
      console.log("❌ Failed to register test merchant:", error);
    }
  }

  console.log("\n🎉 Deployment completed successfully!");
  console.log("🔗 RemesaPay Contract:", remesaPayAddress);
  
  if (network.name !== "localhost" && network.name !== "hardhat") {
    const explorerUrls: Record<string, string> = {
      base: "https://basescan.org",
      baseTestnet: "https://sepolia.basescan.org",
      optimism: "https://optimistic.etherscan.io",
      optimismTestnet: "https://sepolia-optimism.etherscan.io"
    };
    
    const explorerUrl = explorerUrls[network.name];
    if (explorerUrl) {
      console.log(`🔍 View on Explorer: ${explorerUrl}/address/${remesaPayAddress}`);
    }
  }
}

// Run deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
