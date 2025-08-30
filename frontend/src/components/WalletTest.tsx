'use client';

import { useState } from 'react';
import { WalletConnect } from './WalletConnect';

export function WalletTest() {
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string>('');

  const handleWalletConnect = async (address: string) => {
    setConnectedWallet(address);
    
    try {
      // Test if we can access window.ethereum
      if (typeof window !== 'undefined' && window.ethereum) {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        
        setTestResult(`✅ Connected successfully!
        Chain ID: ${chainId}
        Account: ${accounts[0]}
        Base Network: ${chainId === '0x2105' ? 'Yes' : 'No'}`);
      } else {
        setTestResult('❌ MetaMask not detected');
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Wallet Connection Test</h3>
      
      <WalletConnect onConnect={handleWalletConnect} />
      
      {connectedWallet && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>Connected:</strong> {connectedWallet.substring(0, 6)}...{connectedWallet.substring(-4)}
          </p>
        </div>
      )}
      
      {testResult && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <pre className="text-xs text-gray-700 whitespace-pre-wrap">{testResult}</pre>
        </div>
      )}
    </div>
  );
}
