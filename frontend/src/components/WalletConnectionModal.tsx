'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface WalletConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletConnectionModal({ isOpen, onClose }: WalletConnectionModalProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const { connectors, connect } = useConnect();
  const { isConnected } = useAccount();

  const handleConnect = async (connector: any) => {
    try {
      setIsConnecting(true);
      
      // Special handling for MetaMask to open extension directly
      if (connector.name.toLowerCase().includes('metamask')) {
        // Check if MetaMask is installed
        if (typeof window !== 'undefined' && window.ethereum?.isMetaMask) {
          // Request account access directly
          try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            // If successful, connect via wagmi
            await connect({ connector });
            toast.success('MetaMask connected successfully!');
            onClose();
          } catch (error: any) {
            if (error.code === 4001) {
              toast.error('Connection rejected by user');
            } else {
              toast.error('Failed to connect to MetaMask');
            }
          }
        } else {
          // MetaMask not installed, redirect to install page
          window.open('https://metamask.io/download/', '_blank');
          toast.error('Please install MetaMask extension first');
        }
      } else {
        // For other wallets, use normal connection
        await connect({ connector });
        toast.success(`${connector.name} connected successfully!`);
        onClose();
      }
    } catch (error: any) {
      console.error('Connection error:', error);
      toast.error(error.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  // Check if MetaMask is installed
  const isMetaMaskInstalled = typeof window !== 'undefined' && window.ethereum?.isMetaMask;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-black">Connect Wallet</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-black" />
              </button>
            </div>

            {/* Wallet Options */}
            <div className="space-y-3">
              {connectors.map((connector) => (
                <motion.button
                  key={connector.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleConnect(connector)}
                  disabled={isConnecting}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all flex items-center space-x-4 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                >
                  {/* Wallet Icon */}
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    {connector.name.toLowerCase().includes('metamask') ? (
                      <span className="text-white font-bold text-lg">🦊</span>
                    ) : connector.name.toLowerCase().includes('coinbase') ? (
                      <span className="text-white font-bold text-lg">🔵</span>
                    ) : (
                      <span className="text-white font-bold text-lg">💼</span>
                    )}
                  </div>

                  <div className="flex-1 text-left">
                    <p className="font-semibold text-black">{connector.name}</p>
                    {connector.name.toLowerCase().includes('metamask') && (
                      <p className="text-sm text-gray-600">
                        {isMetaMaskInstalled ? 'Browser extension' : 'Not installed'}
                      </p>
                    )}
                    {connector.name.toLowerCase().includes('coinbase') && (
                      <p className="text-sm text-gray-600">Browser extension or mobile</p>
                    )}
                    {connector.name.toLowerCase().includes('walletconnect') && (
                      <p className="text-sm text-gray-600">Mobile wallets</p>
                    )}
                  </div>

                  {/* Connection Status */}
                  {isConnecting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  ) : (
                    <div className="text-blue-600">
                      {connector.name.toLowerCase().includes('metamask') && !isMetaMaskInstalled ? (
                        <span className="text-xs">Install</span>
                      ) : (
                        <span className="text-xs">Connect</span>
                      )}
                    </div>
                  )}
                </motion.button>
              ))}
            </div>

            {/* MetaMask Special Instructions */}
            {connectors.some(c => c.name.toLowerCase().includes('metamask')) && (
              <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <h3 className="font-semibold text-orange-800 mb-2">💡 MetaMask Tips:</h3>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• Click MetaMask above to open extension directly</li>
                  <li>• Make sure you're on the correct network (Base)</li>
                  <li>• Have some ETH for gas fees</li>
                  {!isMetaMaskInstalled && (
                    <li>• <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer" className="underline text-orange-700">Install MetaMask extension first</a></li>
                  )}
                </ul>
              </div>
            )}

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                New to wallets? <a href="https://ethereum.org/en/wallets/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Learn more</a>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Extend window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}
