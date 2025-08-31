// Backend API service for RemesaPay
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

export interface RemittanceRequest {
  senderAddress: string;
  receiverPhone: string;
  amountUsd: number;
  chainId: number;
  txHash?: string;
}

export interface RemittanceResponse {
  success: boolean;
  message: string;
  data?: {
    remittanceId: string;
    txHash: string;
    sender: string;
    receiver: string;
    amount: number;
    chainId: number;
    status: string;
    timestamp: string;
  };
  errors?: any[];
}

export interface FeeCalculation {
  amount: number;
  fee: number;
  netAmount: number;
}

class RemesaPayAPI {
  private async fetchAPI(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Send remittance to backend for tracking
  async sendRemittance(data: RemittanceRequest): Promise<RemittanceResponse> {
    return this.fetchAPI('/remittances/send', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Calculate fees
  async calculateFee(amount: number): Promise<{ success: boolean; data: FeeCalculation }> {
    return this.fetchAPI('/remittances/calculate-fee', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  // Get remittance by ID
  async getRemittance(id: string) {
    return this.fetchAPI(`/remittances/${id}`);
  }

  // Health check
  async healthCheck() {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    return response.json();
  }

  // Get API status
  async getStatus() {
    return this.fetchAPI('/status');
  }
}

export const remesaPayAPI = new RemesaPayAPI();
