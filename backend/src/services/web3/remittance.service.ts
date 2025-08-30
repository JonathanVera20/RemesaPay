import { Address, Hash, parseUnits, formatUnits, encodeFunctionData } from 'viem';
import { keccak256, toBytes } from 'viem';
import walletService from './wallet.service';
import config from '../../config/config';
import logger, { logRemittance } from '../../utils/logger';
import redisService from '../redis';
import prisma from '../../config/database';
import * as fs from 'fs';
import * as path from 'path';

// Load contract ABIs from artifacts
function loadContractABI(contractName: string) {
  try {
    const artifactPath = path.join(__dirname, `../../artifacts/contracts/${contractName}.sol/${contractName}.json`);
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    return artifact.abi;
  } catch (error) {
    logger.error(`Failed to load ABI for ${contractName}:`, error);
    throw new Error(`Contract ABI not found for ${contractName}`);
  }
}

// Contract ABIs
const REMESA_PAY_ABI = loadContractABI('RemesaPay');
const MERCHANT_REGISTRY_ABI = loadContractABI('MerchantRegistry');

// Load deployment addresses
function getContractAddress(contractName: string, network: string): Address {
  try {
    const deploymentPath = path.join(__dirname, `../../deployments/${network}.json`);
    const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    return deployment.contracts[contractName].address as Address;
  } catch (error) {
    logger.error(`Failed to load contract address for ${contractName} on ${network}:`, error);
    throw new Error(`Contract address not found for ${contractName} on ${network}`);
  }
}

export interface SendRemittanceParams {
  senderAddress: Address;
  receiverPhone: string;
  amountUsd: number;
  chainId: number;
  ensSubdomain?: string;
  purpose?: string;
  notes?: string;
}

export interface RemittanceInfo {
  id: string;
  sender: Address;
  phoneHash: string;
  amount: string;
  fee: string;
  isClaimed: boolean;
  unlockTime: Date;
  txHash?: Hash;
}

export interface ClaimRemittanceParams {
  remittanceId: string;
  merchantAddress: Address;
  verificationCode: string;
  chainId: number;
}

class RemittanceService {
  // Hash phone number for privacy
  private hashPhoneNumber(phoneNumber: string): `0x${string}` {
    // Remove all non-numeric characters and ensure it starts with country code
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const phoneBytes = toBytes(cleanPhone);
    return keccak256(phoneBytes);
  }

  // Calculate fees (0.5% of amount)
  private calculateFee(amountUsd: number): number {
    return Math.round(amountUsd * 0.005 * 100) / 100; // 0.5% fee, rounded to 2 decimals
  }

  // Convert USD to USDC (1:1 for now, can be enhanced with real exchange rates)
  private async convertUsdToUsdc(amountUsd: number): Promise<number> {
    // In a real implementation, you'd fetch the current exchange rate
    // For now, we assume 1 USD = 1 USDC
    return amountUsd;
  }

  // Get current exchange rate from cache or API
  private async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
    try {
      const cacheKey = `exchange_rate:${fromCurrency}:${toCurrency}`;
      const cached = await redisService.get(cacheKey);
      
      if (cached) {
        return parseFloat(cached);
      }

      // Fetch from external API (implementation depends on provider)
      const rate = await this.fetchExchangeRate(fromCurrency, toCurrency);
      
      // Cache for 1 minute
      await redisService.set(cacheKey, rate.toString(), 60);
      
      return rate;
    } catch (error) {
      logger.error('Error getting exchange rate:', error);
      return 1; // Fallback to 1:1 ratio
    }
  }

  // Fetch exchange rate from external API
  private async fetchExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
    // Implementation would use CoinGecko, CoinMarketCap, or other APIs
    // For now, return 1:1
    return 1;
  }

  // Send remittance on blockchain
  async sendRemittance(params: SendRemittanceParams): Promise<RemittanceInfo> {
    try {
      const {
        senderAddress,
        receiverPhone,
        amountUsd,
        chainId,
        ensSubdomain = '',
        purpose,
        notes
      } = params;

      // Validate inputs
      if (!walletService.isValidAddress(senderAddress)) {
        throw new Error('Invalid sender address');
      }

      if (!receiverPhone || receiverPhone.length < 10) {
        throw new Error('Invalid receiver phone number');
      }

      if (amountUsd <= 0 || amountUsd > config.ecuador.maxRemittanceAmount) {
        throw new Error(`Amount must be between $1 and $${config.ecuador.maxRemittanceAmount}`);
      }

      // Hash phone number for privacy
      const phoneHash = this.hashPhoneNumber(receiverPhone);
      
      // Calculate fee and amounts
      const fee = this.calculateFee(amountUsd);
      const amountUsdc = await this.convertUsdToUsdc(amountUsd);
      const totalAmount = amountUsdc + fee;

      // Get contract configuration
      const contractConfig = chainId === config.base.chainId ? config.base : config.optimism;
      
      // Check if sender has enough USDC balance
      const senderBalance = await walletService.getTokenBalance(
        contractConfig.usdcAddress as Address,
        senderAddress,
        chainId
      );

      if (parseFloat(senderBalance) < totalAmount) {
        throw new Error('Insufficient USDC balance');
      }

      // Prepare contract call data
      const functionData = encodeFunctionData({
        abi: REMESA_PAY_ABI,
        functionName: 'sendRemittance',
        args: [
          phoneHash,
          contractConfig.usdcAddress as Address,
          parseUnits(amountUsdc.toString(), 6), // USDC has 6 decimals
          ensSubdomain
        ]
      });

      // Estimate gas
      const gasEstimate = await walletService.estimateGas(
        contractConfig.remesaPayContract as Address,
        functionData,
        0n,
        chainId
      );

      // Send transaction (this would be done by the user's wallet in the frontend)
      // For now, we'll create a pending record and return it
      const remittanceId = `rem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Store in database
      const remittance = await prisma.remittance.create({
        data: {
          id: remittanceId,
          senderId: senderAddress,
          receiverPhone,
          amountUsd: amountUsd,
          amountUsdc: amountUsdc,
          feeUsd: fee,
          exchangeRate: 1, // USD to USDC rate
          status: 'PENDING',
          network: chainId === config.base.chainId ? 'base' : 'optimism',
          purpose,
          notes,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        }
      });

      // Log the remittance
      logRemittance('REMITTANCE_INITIATED', remittanceId, {
        senderAddress,
        receiverPhone: `***${receiverPhone.slice(-4)}`, // Log only last 4 digits
        amountUsd,
        fee,
        chainId
      });

      // Cache remittance info for quick access
      await redisService.set(
        `remittance:${remittanceId}`,
        JSON.stringify(remittance),
        3600 // 1 hour
      );

      return {
        id: remittanceId,
        sender: senderAddress,
        phoneHash,
        amount: amountUsdc.toString(),
        fee: fee.toString(),
        isClaimed: false,
        unlockTime: remittance.expiresAt,
      };

    } catch (error) {
      logger.error('Error sending remittance:', error);
      throw error;
    }
  }

  // Confirm remittance transaction
  async confirmRemittance(remittanceId: string, txHash: Hash, chainId: number): Promise<void> {
    try {
      // Wait for transaction confirmation
      const receipt = await walletService.waitForTransaction(txHash, chainId);
      
      if (receipt.status !== 'success') {
        throw new Error('Transaction failed');
      }

      // Update remittance in database
      await prisma.remittance.update({
        where: { id: remittanceId },
        data: {
          status: 'CONFIRMED',
          txHash,
          blockNumber: receipt.blockNumber,
        }
      });

      // Update cache
      const remittance = await prisma.remittance.findUnique({
        where: { id: remittanceId }
      });

      if (remittance) {
        await redisService.set(
          `remittance:${remittanceId}`,
          JSON.stringify(remittance),
          3600
        );
      }

      logRemittance('REMITTANCE_CONFIRMED', remittanceId, {
        txHash,
        blockNumber: receipt.blockNumber.toString(),
        gasUsed: receipt.gasUsed.toString()
      });

    } catch (error) {
      logger.error(`Error confirming remittance ${remittanceId}:`, error);
      
      // Mark as failed
      await prisma.remittance.update({
        where: { id: remittanceId },
        data: { status: 'FAILED' }
      });

      throw error;
    }
  }

  // Claim remittance
  async claimRemittance(params: ClaimRemittanceParams): Promise<Hash> {
    try {
      const { remittanceId, merchantAddress, verificationCode, chainId } = params;

      // Get remittance from database
      const remittance = await prisma.remittance.findUnique({
        where: { id: remittanceId },
        include: { merchant: true }
      });

      if (!remittance) {
        throw new Error('Remittance not found');
      }

      if (remittance.status !== 'CONFIRMED') {
        throw new Error('Remittance is not confirmed yet');
      }

      if (remittance.claimedAt) {
        throw new Error('Remittance already claimed');
      }

      if (new Date() > remittance.expiresAt) {
        throw new Error('Remittance has expired');
      }

      // Verify merchant and verification code
      if (!remittance.merchant || remittance.merchant.walletAddress !== merchantAddress) {
        throw new Error('Invalid merchant');
      }

      // In a real implementation, you'd verify the verification code
      // For now, we'll assume it's valid if provided
      if (!verificationCode || verificationCode.length < 6) {
        throw new Error('Invalid verification code');
      }

      // Get contract configuration
      const contractConfig = chainId === config.base.chainId ? config.base : config.optimism;

      // Prepare contract call data
      const functionData = encodeFunctionData({
        abi: REMESA_PAY_ABI,
        functionName: 'claimRemittance',
        args: [
          BigInt(remittance.id), // This would be the on-chain ID in a real implementation
          merchantAddress
        ]
      });

      // This would be executed by the merchant's wallet
      // For now, we'll use the operator wallet
      const txHash = await walletService.sendNativeToken(
        contractConfig.remesaPayContract as Address,
        '0', // No ETH value
        chainId
      );

      // Update remittance status
      await prisma.remittance.update({
        where: { id: remittanceId },
        data: {
          status: 'CLAIMED',
          claimedAt: new Date(),
          merchantId: remittance.merchant?.id,
        }
      });

      // Create cash-out record
      await prisma.cashOut.create({
        data: {
          remittanceId,
          merchantId: remittance.merchant!.id,
          amount: remittance.amountUsdc,
          commission: remittance.feeUsd,
          netAmount: remittance.amountUsdc - remittance.feeUsd,
          qrCode: `qr_${remittanceId}`,
          verificationCode,
          verifiedAt: new Date(),
          verifiedBy: merchantAddress,
        }
      });

      logRemittance('REMITTANCE_CLAIMED', remittanceId, {
        merchantAddress,
        txHash,
        amount: remittance.amountUsdc.toString()
      });

      return txHash;

    } catch (error) {
      logger.error('Error claiming remittance:', error);
      throw error;
    }
  }

  // Get remittance info
  async getRemittance(remittanceId: string): Promise<RemittanceInfo | null> {
    try {
      // Try cache first
      const cached = await redisService.get(`remittance:${remittanceId}`);
      if (cached) {
        const data = JSON.parse(cached);
        return {
          id: data.id,
          sender: data.senderId as Address,
          phoneHash: this.hashPhoneNumber(data.receiverPhone),
          amount: data.amountUsdc.toString(),
          fee: data.feeUsd.toString(),
          isClaimed: !!data.claimedAt,
          unlockTime: new Date(data.expiresAt),
          txHash: data.txHash as Hash | undefined,
        };
      }

      // Get from database
      const remittance = await prisma.remittance.findUnique({
        where: { id: remittanceId }
      });

      if (!remittance) {
        return null;
      }

      const info: RemittanceInfo = {
        id: remittance.id,
        sender: remittance.senderId as Address,
        phoneHash: this.hashPhoneNumber(remittance.receiverPhone),
        amount: remittance.amountUsdc.toString(),
        fee: remittance.feeUsd.toString(),
        isClaimed: !!remittance.claimedAt,
        unlockTime: remittance.expiresAt,
        txHash: remittance.txHash as Hash | undefined,
      };

      // Cache for 1 hour
      await redisService.set(`remittance:${remittanceId}`, JSON.stringify(remittance), 3600);

      return info;

    } catch (error) {
      logger.error(`Error getting remittance ${remittanceId}:`, error);
      return null;
    }
  }

  // Get remittances by phone number (for receiver)
  async getRemittancesByPhone(phoneNumber: string): Promise<RemittanceInfo[]> {
    try {
      const remittances = await prisma.remittance.findMany({
        where: {
          receiverPhone: phoneNumber,
          status: 'CONFIRMED'
        },
        orderBy: { createdAt: 'desc' },
        take: 50 // Limit to 50 recent remittances
      });

      return remittances.map(r => ({
        id: r.id,
        sender: r.senderId as Address,
        phoneHash: this.hashPhoneNumber(r.receiverPhone),
        amount: r.amountUsdc.toString(),
        fee: r.feeUsd.toString(),
        isClaimed: !!r.claimedAt,
        unlockTime: r.expiresAt,
        txHash: r.txHash as Hash | undefined,
      }));

    } catch (error) {
      logger.error(`Error getting remittances for phone ${phoneNumber}:`, error);
      return [];
    }
  }

  // Get fee calculation for amount
  async calculateRemittanceFee(amountUsd: number): Promise<{ fee: number; total: number }> {
    const fee = this.calculateFee(amountUsd);
    return {
      fee,
      total: amountUsd + fee
    };
  }

  // Check if phone has pending remittances
  async hasPendingRemittances(phoneNumber: string): Promise<boolean> {
    try {
      const count = await prisma.remittance.count({
        where: {
          receiverPhone: phoneNumber,
          status: 'CONFIRMED',
          claimedAt: null,
          expiresAt: {
            gt: new Date()
          }
        }
      });

      return count > 0;
    } catch (error) {
      logger.error('Error checking pending remittances:', error);
      return false;
    }
  }
}

export default new RemittanceService();
