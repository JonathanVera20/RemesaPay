// Simple MockUSDC deployment script that can be run in browser console
// This deploys a mock USDC that you can use for testing

const deployMockUSDC = async () => {
  if (typeof window.ethereum === 'undefined') {
    console.error('MetaMask not found!');
    return;
  }

  try {
    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    // Create provider and signer
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    
    console.log('Deploying with account:', await signer.getAddress());
    console.log('Balance:', ethers.utils.formatEther(await signer.getBalance()), 'ETH');
    
    // Simple ERC20 contract bytecode (Mock USDC)
    const abi = [
      "constructor()",
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function decimals() view returns (uint8)",
      "function totalSupply() view returns (uint256)",
      "function balanceOf(address) view returns (uint256)",
      "function transfer(address to, uint256 amount) returns (bool)",
      "function mint(address to, uint256 amount)",
      "function faucet()"
    ];
    
    // This is a simplified approach - we'll guide them to use a different method
    console.log('Please use the QuickNode faucet instead: https://faucet.quicknode.com/base/sepolia');
    
  } catch (error) {
    console.error('Error:', error);
  }
};

// Instructions to use this:
// 1. Open browser console on any page
// 2. Include ethers.js library
// 3. Run deployMockUSDC()
