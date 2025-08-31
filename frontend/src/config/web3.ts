import { createConfig } from 'wagmi';
import { base, baseSepolia, sepolia, hardhat } from 'wagmi/chains';
import { coinbaseWallet, metaMask, walletConnect } from 'wagmi/connectors';
import { http } from 'viem';

// Define the chains we support (including Ethereum Sepolia for SepoliaETH)
export const supportedChains = [sepolia, baseSepolia, base, hardhat] as const;

// WalletConnect Project ID (you'll need to get this from https://cloud.walletconnect.com/)
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id';

// Configure wagmi with SSR-safe settings
export const wagmiConfig = createConfig({
  chains: supportedChains,
  connectors: [
    metaMask({
      dappMetadata: {
        name: 'RemesaPay',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://remesapay.com',
        iconUrl: 'https://remesapay.com/logo.png',
      },
    }),
    coinbaseWallet({ 
      appName: 'RemesaPay',
      appLogoUrl: 'https://remesapay.com/logo.png',
    }),
    // Temporarily disabled WalletConnect to fix SSR issues
    // walletConnect({ 
    //   projectId: walletConnectProjectId,
    //   metadata: {
    //     name: 'RemesaPay',
    //     description: 'Instant blockchain remittances with 0.5% fees',
    //     url: typeof window !== 'undefined' ? window.location.origin : 'https://remesapay.com',
    //     icons: ['https://remesapay.com/logo.png'],
    //   },
    //   showQrModal: false,
    // }),
  ],
  transports: {
    [sepolia.id]: http(),
    [base.id]: http(),
    [baseSepolia.id]: http(),
    [hardhat.id]: http('http://127.0.0.1:8545'),
  },
  ssr: true, // Enable SSR support
});

// Contract addresses for different networks
export const contractAddresses = {
  [sepolia.id]: {
    remesaPay: '0x0000000000000000000000000000000000000000', // Deploy here for Ethereum Sepolia
    usdc: '0x0000000000000000000000000000000000000000', // No official USDC on Ethereum Sepolia
    usdt: '0x0000000000000000000000000000000000000000',
  },
  [base.id]: {
    remesaPay: '0x0000000000000000000000000000000000000000', // Will be updated after deployment
    usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    usdt: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
  },
  [baseSepolia.id]: {
    remesaPay: '0x0000000000000000000000000000000000000000', // Will be updated after deployment
    usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // Official Base Sepolia USDC
    usdt: '0x0000000000000000000000000000000000000000',
  },
  [hardhat.id]: {
    remesaPay: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Default hardhat deployment
    usdc: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', // Mock USDC on hardhat
    usdt: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0', // Mock USDT on hardhat
  },
} as const;

// Token configurations
export const supportedTokens = {
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    isNative: true, // Native token (no contract address needed)
    addresses: {
      [sepolia.id]: '0x0000000000000000000000000000000000000000', // Native ETH on Ethereum Sepolia
      [base.id]: '0x0000000000000000000000000000000000000000', // Native ETH
      [baseSepolia.id]: '0x0000000000000000000000000000000000000000', // Native ETH
      [hardhat.id]: '0x0000000000000000000000000000000000000000', // Native ETH
    },
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    isNative: false,
    addresses: {
      [base.id]: contractAddresses[base.id].usdc,
      [baseSepolia.id]: contractAddresses[baseSepolia.id].usdc,
      [hardhat.id]: contractAddresses[hardhat.id].usdc,
    },
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    isNative: false,
    addresses: {
      [base.id]: contractAddresses[base.id].usdt,
      [baseSepolia.id]: contractAddresses[baseSepolia.id].usdt,
      [hardhat.id]: contractAddresses[hardhat.id].usdt,
    },
  },
} as const;

// RemesaPay contract ABI (simplified for main functions)
export const remesaPayABI = [
  {
    "inputs": [
      { "name": "phoneHash", "type": "bytes32" },
      { "name": "token", "type": "address" },
      { "name": "amount", "type": "uint256" },
      { "name": "ensSubdomain", "type": "string" }
    ],
    "name": "sendRemittance",
    "outputs": [{ "name": "remittanceId", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "phoneHash", "type": "bytes32" },
      { "name": "ensSubdomain", "type": "string" }
    ],
    "name": "sendRemittanceETH",
    "outputs": [{ "name": "remittanceId", "type": "uint256" }],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "remittanceId", "type": "uint256" }],
    "name": "claimRemittance",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "remittanceId", "type": "uint256" }],
    "name": "remittances",
    "outputs": [
      { "name": "sender", "type": "address" },
      { "name": "phoneHash", "type": "bytes32" },
      { "name": "token", "type": "address" },
      { "name": "amount", "type": "uint256" },
      { "name": "fee", "type": "uint256" },
      { "name": "netAmount", "type": "uint256" },
      { "name": "timestamp", "type": "uint256" },
      { "name": "unlockTime", "type": "uint256" },
      { "name": "isClaimed", "type": "bool" },
      { "name": "isLargeAmount", "type": "bool" },
      { "name": "ensSubdomain", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "phoneNumber", "type": "string" },
      { "name": "signature", "type": "bytes" }
    ],
    "name": "registerPhoneNumber",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "remittanceId", "type": "uint256" },
      { "indexed": true, "name": "sender", "type": "address" },
      { "indexed": true, "name": "phoneHash", "type": "bytes32" },
      { "name": "token", "type": "address" },
      { "name": "amount", "type": "uint256" },
      { "name": "fee", "type": "uint256" },
      { "name": "ensSubdomain", "type": "string" }
    ],
    "name": "RemittanceSent",
    "type": "event"
  }
] as const;

// ERC20 token ABI (simplified)
export const erc20ABI = [
  {
    "inputs": [
      { "name": "spender", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
