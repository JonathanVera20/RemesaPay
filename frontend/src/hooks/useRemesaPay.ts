'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useChainId } from 'wagmi';
import { parseUnits, formatUnits, keccak256, toBytes } from 'viem';
import { contractAddresses, supportedTokens, remesaPayABI, erc20ABI } from '@/config/web3';
import { remesaPayAPI } from '@/services/api';
import toast from 'react-hot-toast';

export interface SendRemittanceParams {
  phoneNumber: string;
  token: 'ETH' | 'USDC' | 'USDT';
  amount: string;
  ensSubdomain?: string;
}

export interface RemittanceData {
  id: string;
  sender: string;
  phoneHash: string;
  token: string;
  amount: string;
  fee: string;
  netAmount: string;
  timestamp: number;
  unlockTime: number;
  isClaimed: boolean;
  isLargeAmount: boolean;
  ensSubdomain: string;
}

export function useRemesaPay() {
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { writeContract } = useWriteContract();
  const { data: txReceipt, isLoading: isWaitingForTx } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}`,
  });

  // Handle SSR
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get contract addresses for current chain
  const getContractAddress = (contract: keyof typeof contractAddresses[8453]) => {
    if (!mounted) return contractAddresses[31337][contract]; // Default fallback during SSR
    const addresses = contractAddresses[chainId as keyof typeof contractAddresses];
    return addresses?.[contract] || contractAddresses[31337][contract]; // Fallback to hardhat
  };

  // Hash phone number for privacy
  const hashPhoneNumber = (phoneNumber: string): `0x${string}` => {
    // Remove any non-digit characters and ensure it starts with country code
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const phoneWithCountryCode = cleanPhone.startsWith('593') ? cleanPhone : `593${cleanPhone}`;
    return keccak256(toBytes(phoneWithCountryCode));
  };

  // Calculate fees (0.5%)
  const calculateFee = (amount: string, decimals: number) => {
    const amountBN = parseUnits(amount, decimals);
    const fee = amountBN * BigInt(50) / BigInt(10000); // 0.5%
    const netAmount = amountBN - fee;
    return {
      amount: amountBN,
      fee,
      netAmount,
    };
  };

  // Check token balance
  const { data: tokenBalance } = useReadContract({
    address: getContractAddress('usdc') as `0x${string}`,
    abi: erc20ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address && isConnected,
    },
  });

  // Check token allowance
  const { data: tokenAllowance } = useReadContract({
    address: getContractAddress('usdc') as `0x${string}`,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [address as `0x${string}`, getContractAddress('remesaPay') as `0x${string}`],
    query: {
      enabled: !!address && isConnected,
    },
  });

  // Approve token spending
  const approveToken = async (token: 'USDC' | 'USDT', amount: string) => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return false;
    }

    try {
      setIsLoading(true);
      const tokenConfig = supportedTokens[token];
      const tokenAddress = tokenConfig.addresses[chainId as keyof typeof tokenConfig.addresses];
      const amountBN = parseUnits(amount, tokenConfig.decimals);

      const hash = await writeContract({
        address: tokenAddress as `0x${string}`,
        abi: erc20ABI,
        functionName: 'approve',
        args: [getContractAddress('remesaPay') as `0x${string}`, amountBN],
      });

      setTxHash(hash);
      toast.success('¡Transacción de aprobación enviada!');
      return true;
    } catch (error: any) {
      console.error('Approval error:', error);
      toast.error(error.message || 'Failed to approve token');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Send remittance
  const sendRemittance = async (params: SendRemittanceParams) => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return null;
    }

    try {
      setIsLoading(true);
      const { phoneNumber, token, amount, ensSubdomain = '' } = params;
      
      // Validate amount
      const amountFloat = parseFloat(amount);
      const minAmount = token === 'ETH' ? 0.001 : 10;
      if (amountFloat < minAmount || amountFloat > 10000) {
        toast.error(`Amount must be between ${minAmount} and 10,000 ${token}`);
        return null;
      }

      const tokenConfig = supportedTokens[token];
      const phoneHash = hashPhoneNumber(phoneNumber);
      const { amount: amountBN } = calculateFee(amount, tokenConfig.decimals);

      let hash: string;

      if (token === 'ETH') {
        // For ETH transfers, use native ETH value
        hash = await writeContract({
          address: getContractAddress('remesaPay') as `0x${string}`,
          abi: remesaPayABI,
          functionName: 'sendRemittanceETH',
          args: [phoneHash, ensSubdomain],
          value: amountBN,
        });
      } else {
        // For ERC20 tokens
        const tokenAddress = tokenConfig.addresses[chainId as keyof typeof tokenConfig.addresses];
        hash = await writeContract({
          address: getContractAddress('remesaPay') as `0x${string}`,
          abi: remesaPayABI,
          functionName: 'sendRemittance',
          args: [phoneHash, tokenAddress as `0x${string}`, amountBN, ensSubdomain],
        });
      }

      setTxHash(hash);
      
      // Send transaction data to backend for tracking
      try {
        await remesaPayAPI.sendRemittance({
          senderAddress: address,
          receiverPhone: phoneNumber,
          amountUsd: parseFloat(amount),
          chainId,
          txHash: hash
        });
      } catch (backendError) {
        console.warn('Backend logging failed:', backendError);
        // Don't fail the transaction if backend is unavailable
      }

      toast.success('¡Remesa enviada exitosamente!');
      return hash;
    } catch (error: any) {
      console.error('Send remittance error:', error);
      toast.error(error.message || 'Failed to send remittance');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Claim remittance
  const claimRemittance = async (remittanceId: string) => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return null;
    }

    try {
      setIsLoading(true);
      
      const hash = await writeContract({
        address: getContractAddress('remesaPay') as `0x${string}`,
        abi: remesaPayABI,
        functionName: 'claimRemittance',
        args: [BigInt(remittanceId)],
      });

      setTxHash(hash);
      toast.success('¡Remesa reclamada exitosamente!');
      return hash;
    } catch (error: any) {
      console.error('Claim remittance error:', error);
      toast.error(error.message || 'Failed to claim remittance');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Get remittance details
  const { data: remittanceData, refetch: refetchRemittance } = useReadContract({
    address: getContractAddress('remesaPay') as `0x${string}`,
    abi: remesaPayABI,
    functionName: 'remittances',
    args: [BigInt(0)], // Will be updated dynamically
  });

  return {
    // State
    isLoading: isLoading || isWaitingForTx,
    txHash,
    txReceipt,
    isConnected,
    address,
    chainId,

    // Token info
    tokenBalance: tokenBalance ? formatUnits(tokenBalance as bigint, 6) : '0',
    tokenAllowance: tokenAllowance ? formatUnits(tokenAllowance as bigint, 6) : '0',

    // Functions
    approveToken,
    sendRemittance,
    claimRemittance,
    calculateFee,
    hashPhoneNumber,
    refetchRemittance,

    // Contract addresses
    getContractAddress,
  };
}
