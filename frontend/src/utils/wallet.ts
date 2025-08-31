// Utility to check MetaMask installation and connection
export const checkMetaMaskInstallation = () => {
  if (typeof window === 'undefined') return false;
  
  // Check if MetaMask is installed
  const ethereum = (window as any).ethereum;
  if (!ethereum) {
    console.log('MetaMask not detected');
    return false;
  }
  
  // Check if it's MetaMask (not another wallet)
  if (!ethereum.isMetaMask) {
    console.log('Ethereum provider detected but not MetaMask');
    return false;
  }
  
  console.log('MetaMask detected successfully');
  return true;
};

// Force MetaMask connection (fallback method)
export const connectToMetaMask = async () => {
  if (typeof window === 'undefined') return null;
  
  const ethereum = (window as any).ethereum;
  if (!ethereum || !ethereum.isMetaMask) {
    throw new Error('MetaMask not found');
  }
  
  try {
    // Request account access
    const accounts = await ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    console.log('MetaMask connected:', accounts[0]);
    return accounts[0];
  } catch (error) {
    console.error('Error connecting to MetaMask:', error);
    throw error;
  }
};

// Check if user needs to switch to a supported network
export const checkNetwork = async () => {
  if (typeof window === 'undefined') return false;
  
  const ethereum = (window as any).ethereum;
  if (!ethereum) return false;
  
  try {
    const chainId = await ethereum.request({ method: 'eth_chainId' });
    console.log('Current chain ID:', chainId);
    
    // Check if on supported network (Base, Base Sepolia, or local)
    const supportedChains = ['0x2105', '0x14a34', '0x7a69']; // Base, Base Sepolia, Hardhat
    return supportedChains.includes(chainId);
  } catch (error) {
    console.error('Error checking network:', error);
    return false;
  }
};
