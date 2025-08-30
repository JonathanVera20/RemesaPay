'use client';

import { createConfig, http } from 'wagmi';
import { base, optimism, baseGoerli, optimismGoerli } from 'wagmi/chains';
import { coinbaseWallet, metaMask, walletConnect } from 'wagmi/connectors';

// Get project ID from environment
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;

if (!projectId) {
  throw new Error('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set');
}

// Define custom chains if needed
const baseSepolia = {
  id: 84532,
  name: 'Base Sepolia',
  network: 'base-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['https://sepolia.base.org'] },
    default: { http: ['https://sepolia.base.org'] },
  },
  blockExplorers: {
    etherscan: { name: 'BaseScan', url: 'https://sepolia.basescan.org' },
    default: { name: 'BaseScan', url: 'https://sepolia.basescan.org' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 1059647,
    },
  },
} as const;

const optimismSepolia = {
  id: 11155420,
  name: 'Optimism Sepolia',
  network: 'optimism-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['https://sepolia.optimism.io'] },
    default: { http: ['https://sepolia.optimism.io'] },
  },
  blockExplorers: {
    etherscan: { name: 'Optimism Etherscan', url: 'https://sepolia-optimism.etherscan.io' },
    default: { name: 'Optimism Etherscan', url: 'https://sepolia-optimism.etherscan.io' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 4071408,
    },
  },
} as const;

// Configure chains based on environment
const chains = process.env.NEXT_PUBLIC_ENABLE_TESTNET === 'true' 
  ? [base, optimism, baseSepolia, optimismSepolia] as const
  : [base, optimism] as const;

// Configure connectors
const connectors = [
  coinbaseWallet({
    appName: 'RemesaPay',
    appLogoUrl: 'https://remesapay.com/logo.png',
  }),
  metaMask({
    dappMetadata: {
      name: 'RemesaPay',
      url: 'https://remesapay.com',
    },
  }),
  walletConnect({
    projectId,
    metadata: {
      name: 'RemesaPay',
      description: 'Instant blockchain remittances to Ecuador',
      url: 'https://remesapay.com',
      icons: ['https://remesapay.com/logo.png'],
    },
  }),
];

// Create wagmi config
export const config = createConfig({
  chains,
  connectors,
  transports: {
    [base.id]: http(process.env.NEXT_PUBLIC_BASE_RPC_URL),
    [optimism.id]: http(process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL),
    [baseSepolia.id]: http(process.env.NEXT_PUBLIC_BASE_TESTNET_RPC_URL),
    [optimismSepolia.id]: http(process.env.NEXT_PUBLIC_OPTIMISM_TESTNET_RPC_URL),
  },
  ssr: true,
});

// Contract addresses by chain
export const CONTRACT_ADDRESSES = {
  [base.id]: {
    remesaPay: process.env.NEXT_PUBLIC_REMESA_CONTRACT_BASE as `0x${string}`,
    usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}`,
    usdt: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2' as `0x${string}`,
  },
  [optimism.id]: {
    remesaPay: process.env.NEXT_PUBLIC_REMESA_CONTRACT_OPTIMISM as `0x${string}`,
    usdc: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607' as `0x${string}`,
    usdt: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58' as `0x${string}`,
  },
  [baseSepolia.id]: {
    remesaPay: process.env.NEXT_PUBLIC_REMESA_CONTRACT_BASE_TESTNET as `0x${string}`,
    usdc: '0xF175520C52418dfE19C8098071a252da48Cd1C19' as `0x${string}`,
    usdt: '0x0000000000000000000000000000000000000000' as `0x${string}`,
  },
  [optimismSepolia.id]: {
    remesaPay: process.env.NEXT_PUBLIC_REMESA_CONTRACT_OPTIMISM_TESTNET as `0x${string}`,
    usdc: '0xe05606174bac4A6364B31bd0eCA4bf4dD368f8C6' as `0x${string}`,
    usdt: '0x0000000000000000000000000000000000000000' as `0x${string}`,
  },
} as const;

// Supported tokens
export const SUPPORTED_TOKENS = {
  USDC: {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    icon: '/tokens/usdc.png',
  },
  USDT: {
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: 6,
    icon: '/tokens/usdt.png',
  },
} as const;

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
