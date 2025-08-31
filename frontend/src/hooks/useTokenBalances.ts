'use client';

import { useAccount, useBalance, useReadContract, useChainId } from 'wagmi';
import { contractAddresses, supportedTokens, erc20ABI } from '@/config/web3';

export function useTokenBalances() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  // ETH Balance
  const { data: ethBalance } = useBalance({
    address: address,
    query: {
      enabled: !!address && isConnected,
    },
  });

  // USDC Balance
  const { data: usdcBalance } = useReadContract({
    address: contractAddresses[chainId as keyof typeof contractAddresses]?.usdc as `0x${string}`,
    abi: erc20ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address && isConnected && !!contractAddresses[chainId as keyof typeof contractAddresses]?.usdc,
    },
  });

  // USDT Balance
  const { data: usdtBalance } = useReadContract({
    address: contractAddresses[chainId as keyof typeof contractAddresses]?.usdt as `0x${string}`,
    abi: erc20ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address && isConnected && !!contractAddresses[chainId as keyof typeof contractAddresses]?.usdt,
    },
  });

  // Format balances
  const getBalance = (token: 'ETH' | 'USDC' | 'USDT'): string => {
    switch (token) {
      case 'ETH':
        return ethBalance ? ethBalance.formatted : '0';
      case 'USDC':
        return usdcBalance ? (Number(usdcBalance) / 1e6).toFixed(6) : '0';
      case 'USDT':
        return usdtBalance ? (Number(usdtBalance) / 1e6).toFixed(6) : '0';
      default:
        return '0';
    }
  };

  // Get raw balance (for calculations)
  const getRawBalance = (token: 'ETH' | 'USDC' | 'USDT'): bigint => {
    switch (token) {
      case 'ETH':
        return ethBalance ? ethBalance.value : 0n;
      case 'USDC':
        return usdcBalance ? usdcBalance as bigint : 0n;
      case 'USDT':
        return usdtBalance ? usdtBalance as bigint : 0n;
      default:
        return 0n;
    }
  };

  return {
    getBalance,
    getRawBalance,
    ethBalance: ethBalance?.formatted || '0',
    usdcBalance: usdcBalance ? (Number(usdcBalance) / 1e6).toFixed(6) : '0',
    usdtBalance: usdtBalance ? (Number(usdtBalance) / 1e6).toFixed(6) : '0',
    isLoading: !address || !isConnected,
  };
}
