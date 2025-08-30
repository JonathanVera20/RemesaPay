import { createWalletClient, createPublicClient, http, parseEther, formatEther, Address, Hash } from 'viem';
import { base, optimism } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import config from '../../config/config';
import logger from '../../utils/logger';
import redisService from '../redis';

export interface WalletConnection {
  address: Address;
  chainId: number;
  balance?: string;
  ensName?: string;
}

export interface TransactionReceipt {
  hash: Hash;
  blockNumber: bigint;
  gasUsed: bigint;
  status: 'success' | 'reverted';
}

class WalletService {
  private basePublicClient;
  private baseWalletClient;
  private optimismPublicClient;
  private optimismWalletClient;
  private operatorAccount;

  constructor() {
    // Initialize operator account
    this.operatorAccount = privateKeyToAccount(config.operatorPrivateKey as `0x${string}`);

    // Initialize Base clients
    this.basePublicClient = createPublicClient({
      chain: base,
      transport: http(config.base.rpcUrl),
    });

    this.baseWalletClient = createWalletClient({
      account: this.operatorAccount,
      chain: base,
      transport: http(config.base.rpcUrl),
    });

    // Initialize Optimism clients
    this.optimismPublicClient = createPublicClient({
      chain: optimism,
      transport: http(config.optimism.rpcUrl),
    });

    this.optimismWalletClient = createWalletClient({
      account: this.operatorAccount,
      chain: optimism,
      transport: http(config.optimism.rpcUrl),
    });
  }

  // Get the appropriate clients based on chain
  private getClients(chainId: number) {
    switch (chainId) {
      case base.id:
        return {
          publicClient: this.basePublicClient,
          walletClient: this.baseWalletClient,
          chain: base,
          config: config.base,
        };
      case optimism.id:
        return {
          publicClient: this.optimismPublicClient,
          walletClient: this.optimismWalletClient,
          chain: optimism,
          config: config.optimism,
        };
      default:
        throw new Error(`Unsupported chain ID: ${chainId}`);
    }
  }

  // Connect to wallet and get basic info
  async connectWallet(address: Address, chainId: number): Promise<WalletConnection> {
    try {
      const { publicClient } = this.getClients(chainId);
      
      // Get balance
      const balance = await publicClient.getBalance({ address });
      
      // Try to resolve ENS name (if on mainnet)
      let ensName: string | undefined;
      try {
        ensName = await publicClient.getEnsName({ address });
      } catch (error) {
        // ENS not available on this chain
      }

      const connection: WalletConnection = {
        address,
        chainId,
        balance: formatEther(balance),
        ensName,
      };

      // Cache connection for 5 minutes
      await redisService.set(
        `wallet:${address}:${chainId}`,
        JSON.stringify(connection),
        300
      );

      logger.info(`Wallet connected: ${address} on chain ${chainId}`);
      return connection;
    } catch (error) {
      logger.error(`Error connecting wallet ${address}:`, error);
      throw new Error('Failed to connect wallet');
    }
  }

  // Get cached wallet connection
  async getCachedWalletConnection(address: Address, chainId: number): Promise<WalletConnection | null> {
    try {
      const cached = await redisService.get(`wallet:${address}:${chainId}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      logger.error('Error getting cached wallet connection:', error);
      return null;
    }
  }

  // Check if address is valid
  isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  // Get transaction receipt
  async getTransactionReceipt(txHash: Hash, chainId: number): Promise<TransactionReceipt | null> {
    try {
      const { publicClient } = this.getClients(chainId);
      const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
      
      return {
        hash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed,
        status: receipt.status === 'success' ? 'success' : 'reverted',
      };
    } catch (error) {
      logger.error(`Error getting transaction receipt ${txHash}:`, error);
      return null;
    }
  }

  // Wait for transaction confirmation
  async waitForTransaction(txHash: Hash, chainId: number, maxWaitTime: number = 60000): Promise<TransactionReceipt> {
    const { publicClient } = this.getClients(chainId);
    
    try {
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
        timeout: maxWaitTime,
      });

      return {
        hash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed,
        status: receipt.status === 'success' ? 'success' : 'reverted',
      };
    } catch (error) {
      logger.error(`Error waiting for transaction ${txHash}:`, error);
      throw new Error('Transaction confirmation timeout');
    }
  }

  // Estimate gas for transaction
  async estimateGas(
    to: Address,
    data: `0x${string}`,
    value: bigint = 0n,
    chainId: number
  ): Promise<bigint> {
    try {
      const { publicClient } = this.getClients(chainId);
      
      const gasEstimate = await publicClient.estimateGas({
        account: this.operatorAccount.address,
        to,
        data,
        value,
      });

      // Add 20% buffer to gas estimate
      return gasEstimate + (gasEstimate * 20n) / 100n;
    } catch (error) {
      logger.error('Error estimating gas:', error);
      throw new Error('Failed to estimate gas');
    }
  }

  // Get current gas price
  async getGasPrice(chainId: number): Promise<bigint> {
    try {
      const { publicClient } = this.getClients(chainId);
      return await publicClient.getGasPrice();
    } catch (error) {
      logger.error('Error getting gas price:', error);
      throw new Error('Failed to get gas price');
    }
  }

  // Get ERC20 token balance
  async getTokenBalance(tokenAddress: Address, userAddress: Address, chainId: number): Promise<string> {
    try {
      const { publicClient } = this.getClients(chainId);
      
      // ERC20 balanceOf function signature
      const data = `0x70a08231${userAddress.slice(2).padStart(64, '0')}` as `0x${string}`;
      
      const result = await publicClient.call({
        to: tokenAddress,
        data,
      });

      if (!result.data) {
        throw new Error('No data returned from balanceOf call');
      }

      // Convert hex result to decimal (assuming 6 decimals for USDC)
      const balance = BigInt(result.data);
      return (Number(balance) / 1e6).toString();
    } catch (error) {
      logger.error(`Error getting token balance for ${userAddress}:`, error);
      return '0';
    }
  }

  // Send native token (ETH)
  async sendNativeToken(
    to: Address,
    amount: string,
    chainId: number
  ): Promise<Hash> {
    try {
      const { walletClient } = this.getClients(chainId);
      
      const hash = await walletClient.sendTransaction({
        to,
        value: parseEther(amount),
      });

      logger.info(`Native token sent: ${hash} (${amount} ETH to ${to})`);
      return hash;
    } catch (error) {
      logger.error('Error sending native token:', error);
      throw new Error('Failed to send transaction');
    }
  }

  // Get block number
  async getBlockNumber(chainId: number): Promise<bigint> {
    try {
      const { publicClient } = this.getClients(chainId);
      return await publicClient.getBlockNumber();
    } catch (error) {
      logger.error('Error getting block number:', error);
      throw new Error('Failed to get block number');
    }
  }

  // Check if transaction is confirmed
  async isTransactionConfirmed(txHash: Hash, chainId: number, requiredConfirmations: number = 1): Promise<boolean> {
    try {
      const receipt = await this.getTransactionReceipt(txHash, chainId);
      if (!receipt || receipt.status !== 'success') {
        return false;
      }

      const currentBlock = await this.getBlockNumber(chainId);
      const confirmations = currentBlock - receipt.blockNumber + 1n;
      
      return confirmations >= BigInt(requiredConfirmations);
    } catch (error) {
      logger.error(`Error checking transaction confirmation ${txHash}:`, error);
      return false;
    }
  }

  // Get operator address
  getOperatorAddress(): Address {
    return this.operatorAccount.address;
  }

  // Health check for all networks
  async healthCheck(): Promise<{ [chainId: number]: boolean }> {
    const results: { [chainId: number]: boolean } = {};

    try {
      const baseBlock = await this.getBlockNumber(base.id);
      results[base.id] = baseBlock > 0n;
    } catch {
      results[base.id] = false;
    }

    try {
      const optimismBlock = await this.getBlockNumber(optimism.id);
      results[optimism.id] = optimismBlock > 0n;
    } catch {
      results[optimism.id] = false;
    }

    return results;
  }
}

export default new WalletService();
