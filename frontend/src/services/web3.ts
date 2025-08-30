import { createPublicClient, createWalletClient, custom, parseEther, formatEther } from 'viem';
import { mainnet, polygon, arbitrum } from 'viem/chains';
import { RemesaPayABI } from '@/contracts/abis/RemesaPay';

// Contract addresses (these would be deployed addresses)
export const REMESA_PAY_ADDRESSES = {
  [mainnet.id]: '0x...' as `0x${string}`,
  [polygon.id]: '0x...' as `0x${string}`,
  [arbitrum.id]: '0x...' as `0x${string}`,
};

// Create public client for reading blockchain data
export const publicClient = createPublicClient({
  chain: mainnet,
  transport: custom(window.ethereum),
});

// Create wallet client for writing transactions
export const walletClient = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum),
});

export interface RemittanceData {
  recipient: string;
  amount: string;
  recipientPhoneHash: string;
  feeAmount: string;
}

export class RemesaPayService {
  private contractAddress: `0x${string}`;
  
  constructor(chainId: number = mainnet.id) {
    this.contractAddress = REMESA_PAY_ADDRESSES[chainId];
  }

  // Send remittance
  async sendRemittance(data: RemittanceData) {
    try {
      const { request } = await publicClient.simulateContract({
        address: this.contractAddress,
        abi: RemesaPayABI,
        functionName: 'sendRemittance',
        args: [data.recipient, data.recipientPhoneHash],
        value: parseEther(data.amount),
      });

      const hash = await walletClient.writeContract(request);
      return { success: true, txHash: hash };
    } catch (error) {
      console.error('Send remittance error:', error);
      return { success: false, error: error.message };
    }
  }

  // Claim remittance
  async claimRemittance(phoneNumber: string, verificationCode: string) {
    try {
      // In a real implementation, this would involve phone verification
      const phoneHash = this.hashPhoneNumber(phoneNumber);
      
      const { request } = await publicClient.simulateContract({
        address: this.contractAddress,
        abi: RemesaPayABI,
        functionName: 'claimRemittance',
        args: [phoneHash],
      });

      const hash = await walletClient.writeContract(request);
      return { success: true, txHash: hash };
    } catch (error) {
      console.error('Claim remittance error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user's remittances
  async getUserRemittances(userAddress: string) {
    try {
      const remittances = await publicClient.readContract({
        address: this.contractAddress,
        abi: RemesaPayABI,
        functionName: 'getUserRemittances',
        args: [userAddress],
      });

      return { success: true, remittances };
    } catch (error) {
      console.error('Get remittances error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get pending claims for phone number
  async getPendingClaims(phoneNumber: string) {
    try {
      const phoneHash = this.hashPhoneNumber(phoneNumber);
      
      const claims = await publicClient.readContract({
        address: this.contractAddress,
        abi: RemesaPayABI,
        functionName: 'getPendingClaims',
        args: [phoneHash],
      });

      return { success: true, claims };
    } catch (error) {
      console.error('Get pending claims error:', error);
      return { success: false, error: error.message };
    }
  }

  // Calculate fees
  async calculateFees(amount: string) {
    try {
      const fees = await publicClient.readContract({
        address: this.contractAddress,
        abi: RemesaPayABI,
        functionName: 'calculateFees',
        args: [parseEther(amount)],
      });

      return {
        success: true,
        fees: {
          platform: formatEther(fees[0]),
          gas: formatEther(fees[1]),
          total: formatEther(fees[0] + fees[1])
        }
      };
    } catch (error) {
      console.error('Calculate fees error:', error);
      return { success: false, error: error.message };
    }
  }

  // Register as merchant
  async registerMerchant(businessName: string, businessType: string) {
    try {
      const { request } = await publicClient.simulateContract({
        address: this.contractAddress,
        abi: RemesaPayABI,
        functionName: 'registerMerchant',
        args: [businessName, businessType],
      });

      const hash = await walletClient.writeContract(request);
      return { success: true, txHash: hash };
    } catch (error) {
      console.error('Register merchant error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get merchant info
  async getMerchantInfo(merchantAddress: string) {
    try {
      const merchantInfo = await publicClient.readContract({
        address: this.contractAddress,
        abi: RemesaPayABI,
        functionName: 'merchants',
        args: [merchantAddress],
      });

      return { success: true, merchantInfo };
    } catch (error) {
      console.error('Get merchant info error:', error);
      return { success: false, error: error.message };
    }
  }

  // Process merchant payment
  async processMerchantPayment(amount: string, merchantAddress: string) {
    try {
      const { request } = await publicClient.simulateContract({
        address: this.contractAddress,
        abi: RemesaPayABI,
        functionName: 'processMerchantPayment',
        args: [merchantAddress],
        value: parseEther(amount),
      });

      const hash = await walletClient.writeContract(request);
      return { success: true, txHash: hash };
    } catch (error) {
      console.error('Process merchant payment error:', error);
      return { success: false, error: error.message };
    }
  }

  // Utility function to hash phone numbers (simplified)
  private hashPhoneNumber(phoneNumber: string): string {
    // In production, this would use a proper hashing algorithm
    // and include salt for security
    return `0x${Buffer.from(phoneNumber).toString('hex').padEnd(64, '0')}`;
  }

  // Get transaction status
  async getTransactionStatus(txHash: string) {
    try {
      const receipt = await publicClient.getTransactionReceipt({
        hash: txHash as `0x${string}`,
      });

      return {
        success: true,
        status: receipt.status === 'success' ? 'confirmed' : 'failed',
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed,
      };
    } catch (error) {
      return {
        success: false,
        status: 'pending',
        error: error.message,
      };
    }
  }

  // Estimate gas for transaction
  async estimateGas(functionName: string, args: any[], value?: bigint) {
    try {
      const gas = await publicClient.estimateContractGas({
        address: this.contractAddress,
        abi: RemesaPayABI,
        functionName,
        args,
        value,
      });

      return { success: true, gasEstimate: gas };
    } catch (error) {
      console.error('Gas estimation error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Phone verification service (mock implementation)
export class PhoneVerificationService {
  async sendVerificationCode(phoneNumber: string): Promise<{ success: boolean; message: string }> {
    // Mock implementation - in production, integrate with SMS service
    console.log(`Sending verification code to ${phoneNumber}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      message: 'Verification code sent successfully'
    };
  }

  async verifyCode(phoneNumber: string, code: string): Promise<{ success: boolean; verified: boolean }> {
    // Mock implementation - in production, verify with SMS service
    console.log(`Verifying code ${code} for ${phoneNumber}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock verification (accept "123456" as valid code)
    const verified = code === '123456';
    
    return {
      success: true,
      verified
    };
  }
}

// Exchange rate service (mock implementation)
export class ExchangeRateService {
  private static instance: ExchangeRateService;
  private rates: { [key: string]: number } = {};
  private lastUpdate: number = 0;
  private updateInterval = 60000; // 1 minute

  static getInstance(): ExchangeRateService {
    if (!ExchangeRateService.instance) {
      ExchangeRateService.instance = new ExchangeRateService();
    }
    return ExchangeRateService.instance;
  }

  async getExchangeRate(from: string, to: string): Promise<{ success: boolean; rate?: number; error?: string }> {
    try {
      await this.updateRatesIfNeeded();
      
      const rateKey = `${from}_${to}`;
      const rate = this.rates[rateKey];
      
      if (!rate) {
        return { success: false, error: 'Exchange rate not available' };
      }
      
      return { success: true, rate };
    } catch (error) {
      console.error('Exchange rate error:', error);
      return { success: false, error: error.message };
    }
  }

  private async updateRatesIfNeeded() {
    const now = Date.now();
    if (now - this.lastUpdate < this.updateInterval) {
      return;
    }

    // Mock exchange rates - in production, fetch from API
    this.rates = {
      'USD_USD': 1,
      'ETH_USD': 2100,
      'USD_ETH': 1/2100,
      'USDC_USD': 1,
      'USD_USDC': 1,
    };
    
    this.lastUpdate = now;
  }

  async convertAmount(amount: number, from: string, to: string): Promise<{ success: boolean; convertedAmount?: number; error?: string }> {
    const rateResult = await this.getExchangeRate(from, to);
    
    if (!rateResult.success) {
      return rateResult;
    }
    
    return {
      success: true,
      convertedAmount: amount * rateResult.rate!
    };
  }
}

// Export singleton instances
export const remesaPayService = new RemesaPayService();
export const phoneVerificationService = new PhoneVerificationService();
export const exchangeRateService = ExchangeRateService.getInstance();
