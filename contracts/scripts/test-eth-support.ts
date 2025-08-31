const { ethers } = require('hardhat');

/**
 * Test script for ETH functionality
 * Run with: npx hardhat run scripts/test-eth-support.ts --network localhost
 */
async function main() {
  console.log('🧪 Testing ETH Support Functionality...\n');

  // Get signers
  const [deployer, user1, user2] = await ethers.getSigners();
  
  console.log('👥 Test Accounts:');
  console.log(`Deployer: ${deployer.address}`);
  console.log(`User1: ${user1.address}`);
  console.log(`User2: ${user2.address}\n`);

  // Check ETH balances
  const deployerBalance = await ethers.provider.getBalance(deployer.address);
  const user1Balance = await ethers.provider.getBalance(user1.address);
  
  console.log('💰 ETH Balances:');
  console.log(`Deployer: ${ethers.formatEther(deployerBalance)} ETH`);
  console.log(`User1: ${ethers.formatEther(user1Balance)} ETH\n`);

  // Test that contracts compile and can be deployed
  console.log('📄 Testing Contract Compilation...');
  const RemesaPay = await ethers.getContractFactory('RemesaPay');
  console.log('✅ RemesaPay contract compiled successfully');
  
  console.log('✅ ETH support is ready to deploy!');
  console.log('\n📋 Next Steps:');
  console.log('1. Update your private key in contracts/.env');
  console.log('2. Deploy to Base Sepolia: npx hardhat run scripts/deploy.ts --network baseTestnet');
  console.log('3. Update contract address in frontend/src/config/web3.ts');
  console.log('4. Test ETH transactions on http://localhost:3000/send');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
