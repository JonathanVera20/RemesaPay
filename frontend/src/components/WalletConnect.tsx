'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { WalletIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface WalletConnectProps {
  onConnect?: (address: string) => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function WalletConnect({ onConnect, variant = 'default', size = 'default' }: WalletConnectProps) {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if wallet is already connected
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          onConnect?.(accounts[0]);
        }
      } catch (err) {
        console.error('Error checking connection:', err);
      }
    }
  };

  const connectWallet = async () => {
    if (!(window as any).ethereum) {
      setError('Por favor instala MetaMask para continuar');
      // Open MetaMask download page
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Request account access
      const accounts = await (window as any).ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        onConnect?.(accounts[0]);

        // Switch to Base network if not already on it
        try {
          await (window as any).ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x2105' }], // Base mainnet chainId in hex
          });
        } catch (switchError: any) {
          // If the network doesn't exist, add it
          if (switchError.code === 4902) {
            await (window as any).ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x2105',
                chainName: 'Base',
                nativeCurrency: {
                  name: 'Ethereum',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['https://mainnet.base.org'],
                blockExplorerUrls: ['https://basescan.org'],
              }],
            });
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error conectando billetera');
      console.error('Connection error:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setError(null);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (account) {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg border border-green-200">
          <CheckCircleIcon className="h-4 w-4" />
          <span className="text-sm font-medium">{formatAddress(account)}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={disconnectWallet}
          className="text-gray-500 hover:text-gray-700"
        >
          Desconectar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={connectWallet}
        disabled={isConnecting}
        variant={variant}
        size={size}
        className="flex items-center space-x-2"
      >
        <WalletIcon className="h-4 w-4" />
        <span>
          {isConnecting ? 'Conectando...' : 'Conectar Billetera'}
        </span>
      </Button>
      
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}
