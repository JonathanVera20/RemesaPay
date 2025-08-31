'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PaperAirplaneIcon,
  PhoneIcon,
  ClockIcon,
  BanknotesIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  PlusIcon,
  GlobeAltIcon,
  UserIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  WalletIcon
} from '@heroicons/react/24/outline';
import Layout from '@/components/Layout';
import { useRemesaPay } from '@/hooks/useRemesaPay';
import { useAccount } from 'wagmi';
import { ConnectKitButton } from 'connectkit';
import { WalletConnectionModal } from '@/components/WalletConnectionModal';
import { checkMetaMaskInstallation, connectToMetaMask } from '@/utils/wallet';
import toast from 'react-hot-toast';

interface Receiver {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  lastSent?: Date;
  walletAddress?: string;
  country?: string;
}

interface Transaction {
  id: string;
  amount: number;
  fee: number;
  recipient: string;
  status: 'pending' | 'completed' | 'claimed';
  date: Date;
  txHash?: string;
}

export default function SendMoneyPage() {
  const [amount, setAmount] = useState('');
  const [selectedReceiver, setSelectedReceiver] = useState<Receiver | null>(null);
  const [currency, setCurrency] = useState<'USDC' | 'USDT'>('USDC');
  const [newReceiverPhone, setNewReceiverPhone] = useState('');
  const [newReceiverName, setNewReceiverName] = useState('');
  const [isAddingReceiver, setIsAddingReceiver] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showManualEntryModal, setShowManualEntryModal] = useState(false);
  const [manualWalletAddress, setManualWalletAddress] = useState('');
  const [userLookup, setUserLookup] = useState<{
    loading: boolean;
    user: any | null;
    error: string | null;
  }>({
    loading: false,
    user: null,
    error: null
  });
  
  // Web3 hooks
  const { isConnected } = useAccount();
  const { 
    isLoading, 
    tokenBalance, 
    tokenAllowance, 
    sendRemittance, 
    approveToken, 
    calculateFee,
    txHash,
    txReceipt 
  } = useRemesaPay();

  // Mock data - show only when user has made transactions
  const [receivers, setReceivers] = useState<Receiver[]>([]);

  const [transactions] = useState<Transaction[]>([]);

  const calculateDisplayFee = (amount: number) => amount * 0.005;
  const calculateTotal = (amount: number) => amount * 1.005;
  const calculateReceives = (amount: number) => amount - calculateDisplayFee(amount);

  const addReceiver = () => {
    if (newReceiverName && newReceiverPhone && userLookup.user) {
      const newReceiver: Receiver = {
        id: Date.now().toString(),
        name: newReceiverName,
        phone: newReceiverPhone,
        avatar: newReceiverName.split(' ').map(n => n[0]).join('').toUpperCase(),
        walletAddress: userLookup.user.walletAddress,
        country: userLookup.user.country
      };
      setReceivers([...receivers, newReceiver]);
      setSelectedReceiver(newReceiver);
      setNewReceiverName('');
      setNewReceiverPhone('');
      setUserLookup({ loading: false, user: null, error: null });
      setIsAddingReceiver(false);
    }
  };

  const addReceiverManually = () => {
    if (newReceiverName && newReceiverPhone && manualWalletAddress) {
      const newReceiver: Receiver = {
        id: Date.now().toString(),
        name: newReceiverName,
        phone: newReceiverPhone,
        avatar: newReceiverName.split(' ').map(n => n[0]).join('').toUpperCase(),
        walletAddress: manualWalletAddress,
        country: 'Manual Entry'
      };
      setReceivers([...receivers, newReceiver]);
      setSelectedReceiver(newReceiver);
      setNewReceiverName('');
      setNewReceiverPhone('');
      setManualWalletAddress('');
      setUserLookup({ loading: false, user: null, error: null });
      setShowManualEntryModal(false);
      setIsAddingReceiver(false);
    }
  };

  // Lookup user by phone number
  const lookupUser = async (phoneNumber: string) => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setUserLookup({ loading: false, user: null, error: null });
      setNewReceiverName(''); // Clear name when phone is cleared
      setSelectedReceiver(null); // Clear selected receiver
      return;
    }

    setUserLookup({ loading: true, user: null, error: null });

    try {
      const response = await fetch(`http://localhost:3001/api/users/phone/${encodeURIComponent(phoneNumber)}`);
      const data = await response.json();

      if (data.success) {
        setUserLookup({ 
          loading: false, 
          user: data.data, 
          error: null 
        });
        
        // Auto-fill the name field when user is found
        setNewReceiverName(data.data.name);
        
        // Auto-select this user as receiver
        setSelectedReceiver({
          id: data.data.id,
          name: data.data.name,
          phone: data.data.phoneNumber,
          walletAddress: data.data.walletAddress,
          country: data.data.country
        });
      } else {
        setUserLookup({ 
          loading: false, 
          user: null, 
          error: 'No registered user found with this phone number' 
        });
        setNewReceiverName(''); // Clear name when user not found
        setSelectedReceiver(null); // Clear selected receiver
      }
    } catch (error) {
      console.error('Error looking up user:', error);
      setUserLookup({ 
        loading: false, 
        user: null, 
        error: 'Error connecting to server' 
      });
      setNewReceiverName(''); // Clear name on error
      setSelectedReceiver(null); // Clear selected receiver
    }
  };

  const filteredReceivers = receivers.filter(receiver =>
    receiver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receiver.phone.includes(searchTerm)
  );

  // Check if approval is needed
  useEffect(() => {
    if (amount && parseFloat(tokenAllowance) < parseFloat(amount)) {
      setNeedsApproval(true);
    } else {
      setNeedsApproval(false);
    }
  }, [amount, tokenAllowance]);

  // Cleanup loading state on unmount
  useEffect(() => {
    return () => {
      // Any cleanup can be added here if needed
    };
  }, []);

  // Check MetaMask installation on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasMetaMask = checkMetaMaskInstallation();
      console.log('MetaMask detected:', hasMetaMask);
      
      if (hasMetaMask) {
        console.log('MetaMask version:', (window as any).ethereum?.version);
      }
    }
  }, []);

  // Enhanced wallet connection with fallback
  const handleWalletConnection = async (show?: () => void) => {
    // First try ConnectKit's built-in connection
    if (show) {
      show();
      return;
    }

    // Fallback: Direct MetaMask connection
    try {
      if (!checkMetaMaskInstallation()) {
        toast.error('MetaMask not detected. Please install MetaMask browser extension.');
        window.open('https://metamask.io/download/', '_blank');
        return;
      }

      toast.loading('Connecting to MetaMask...');
      const account = await connectToMetaMask();
      
      if (account) {
        toast.dismiss();
        toast.success('MetaMask connected successfully!');
      }
    } catch (error: any) {
      toast.dismiss();
      console.error('MetaMask connection error:', error);
      
      if (error.code === 4001) {
        toast.error('Connection rejected by user');
      } else if (error.code === -32002) {
        toast.error('MetaMask is already processing a request. Please check MetaMask.');
      } else {
        toast.error('Failed to connect to MetaMask. Please try again.');
      }
    }
  };

  // Handle send money transaction
  const handleSendMoney = async () => {
    if (!isConnected) {
      setShowWalletModal(true);
      return;
    }

    if (!selectedReceiver || !amount) {
      toast.error('Please select a recipient and enter an amount');
      return;
    }

    if (!userLookup.user) {
      toast.error('Please verify the recipient exists before sending');
      return;
    }

    const amountFloat = parseFloat(amount);
    if (amountFloat < 1 || amountFloat > 10000) {
      toast.error('Amount must be between $1 and $10,000');
      return;
    }

    if (parseFloat(tokenBalance) < amountFloat) {
      toast.error(`Insufficient ${currency} balance`);
      return;
    }

    try {
      // First create the remittance record via API
      toast.loading('Creating remittance...');
      
      const response = await fetch('http://localhost:3001/api/remittance/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderAddress: '0x' + Math.random().toString(16).substr(2, 40), // TODO: Get from wallet
          receiverPhone: selectedReceiver.phone,
          amountUsd: amountFloat,
          recipientName: selectedReceiver.name
        })
      });

      const remittanceData = await response.json();
      toast.dismiss();

      if (!remittanceData.success) {
        toast.error(remittanceData.message || 'Failed to create remittance');
        return;
      }

      // Now handle blockchain transaction if needed
      if (needsApproval) {
        toast.loading('Approving token spend...');
        const approved = await approveToken(currency, amount);
        if (!approved) return;
        toast.dismiss();
      }

      // Send the blockchain transaction to user's wallet
      toast.loading('Sending transaction...');
      const hash = await sendRemittance({
        phoneNumber: selectedReceiver.phone,
        token: currency,
        amount: amount,
        ensSubdomain: `${selectedReceiver.name.toLowerCase().replace(/\s+/g, '')}.remesapay.eth`
      });

      if (hash) {
        // Update the remittance record with transaction hash
        try {
          await fetch(`http://localhost:3001/api/remittance/${remittanceData.data.remittanceId}/transaction`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              txHash: hash,
              status: 'COMPLETED'
            })
          });
        } catch (updateError) {
          console.error('Failed to update remittance with tx hash:', updateError);
        }

        toast.dismiss();
        toast.success(`Money sent successfully to ${userLookup.user.name}!`);
        setShowTransactionModal(true);
        
        // Reset form
        setAmount('');
        setSelectedReceiver(null);
        setUserLookup({ loading: false, user: null, error: null });
      }
    } catch (error) {
      console.error('Transaction error:', error);
      toast.dismiss();
      toast.error('Transaction failed. Please try again.');
    }
  };

  // If wallet is not connected, show connection UI
  if (!isConnected) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-blue-50 py-8">
          <div className="container-app">
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-md mx-auto"
              >
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <WalletIcon className="w-12 h-12 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-neutral-900 mb-4">
                  Connect Your Wallet
                </h1>
                <p className="text-neutral-600 mb-8 leading-relaxed">
                  To send money securely through blockchain technology, you need to connect your wallet first.
                </p>
                <ConnectKitButton.Custom>
                  {({ isConnected, show, truncatedAddress, ensName }) => {
                    return (
                      <div className="space-y-3">
                        <button
                          onClick={() => handleWalletConnection(show)}
                          className="btn-primary px-8 py-4 text-lg font-semibold w-full"
                        >
                          <WalletIcon className="w-5 h-5 mr-2" />
                          {isConnected ? `Connected: ${ensName ?? truncatedAddress}` : 'Connect Wallet'}
                        </button>
                        
                        {!isConnected && checkMetaMaskInstallation() && (
                          <button
                            onClick={() => handleWalletConnection()}
                            className="btn-secondary px-6 py-3 text-sm font-medium w-full"
                          >
                            🦊 Connect MetaMask Directly
                          </button>
                        )}
                      </div>
                    );
                  }}
                </ConnectKitButton.Custom>
                <div className="mt-8 grid grid-cols-3 gap-4 text-sm text-neutral-500">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    </div>
                    <span>Secure</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                      <ClockIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <span>Instant</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                      <BanknotesIcon className="w-5 h-5 text-purple-600" />
                    </div>
                    <span>Low Fees</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-blue-50 py-8">
        <div className="container-app">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900">Send Money</h1>
            <p className="text-neutral-600 mt-1">Fast, secure, and affordable money transfers</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Send Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Amount Input */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="card p-6"
              >
                <h2 className="text-xl font-bold text-neutral-900 mb-4">Amount to Send</h2>
                <div className="space-y-4">
                  <div className="relative">
                    <CurrencyDollarIcon className="w-5 h-5 text-neutral-400 absolute left-3 top-1/2 transform -translate-y-1/2 z-10" />
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="input-field pl-10 pr-20 text-2xl"
                      placeholder="0.00"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10">
                      <select 
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value as 'USDC' | 'USDT')}
                        className="bg-transparent border-none text-lg font-semibold text-neutral-600 focus:outline-none cursor-pointer"
                      >
                        <option value="USDC">USDC</option>
                        <option value="USDT">USDT</option>
                      </select>
                      <ChevronDownIcon className="w-4 h-4 text-neutral-400 absolute right-0 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                  
                  {amount && (
                    <div className="bg-neutral-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-600">Send Amount:</span>
                        <span className="font-semibold">${parseFloat(amount).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-600">Fee (0.5%):</span>
                        <span className="font-semibold">${calculateDisplayFee(parseFloat(amount)).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm border-t border-neutral-200 pt-2">
                        <span className="text-neutral-600">Recipient Receives:</span>
                        <span className="font-bold text-green-600">${calculateReceives(parseFloat(amount)).toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Receiver Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="card p-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-neutral-900">Send to</h2>
                  <button
                    onClick={() => setIsAddingReceiver(true)}
                    className="btn-secondary text-sm px-4 py-2"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Receiver
                  </button>
                </div>

                {/* Show search only if there are receivers */}
                {receivers.length > 0 && (
                  <div className="relative mb-4">
                    <UserIcon className="w-5 h-5 text-neutral-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input-field pl-10"
                      placeholder="Search by name or phone..."
                    />
                  </div>
                )}

                {/* Receivers List or Empty State */}
                {receivers.length === 0 ? (
                  <div className="text-center py-8">
                    <UserIcon className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                    <p className="text-neutral-500 mb-4">No contacts yet</p>
                    <p className="text-sm text-neutral-400">Add a receiver to start sending money</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {filteredReceivers.map((receiver) => (
                      <motion.div
                        key={receiver.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedReceiver(receiver)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                          selectedReceiver?.id === receiver.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">{receiver.avatar}</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-neutral-900">{receiver.name}</h3>
                            <p className="text-sm text-neutral-600">{receiver.phone}</p>
                          </div>
                          {receiver.lastSent && (
                            <div className="text-right">
                              <p className="text-xs text-neutral-500">Last sent</p>
                              <p className="text-xs text-neutral-500">{receiver.lastSent.toLocaleDateString()}</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Send Button */}
              {amount && selectedReceiver && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="space-y-4"
                >
                  {/* Wallet Connection Check */}
                  {!isConnected ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center space-x-3">
                      <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                      <span className="text-yellow-800">Please connect your wallet to send money</span>
                    </div>
                  ) : (
                    <>
                      {/* Balance Display */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-blue-800">Your {currency} Balance:</span>
                          <span className="font-bold text-blue-900">${parseFloat(tokenBalance).toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Approval Status */}
                      {needsApproval && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center space-x-3">
                          <ExclamationTriangleIcon className="w-5 h-5 text-orange-600" />
                          <span className="text-orange-800">Token approval required before sending</span>
                        </div>
                      )}

                      {/* Send Button */}
                      <button
                        onClick={handleSendMoney}
                        disabled={isLoading || parseFloat(tokenBalance) < parseFloat(amount)}
                        className={`w-full py-4 text-lg flex items-center justify-center gap-2 rounded-lg font-semibold transition-all ${
                          isLoading || parseFloat(tokenBalance) < parseFloat(amount)
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'btn-primary hover:scale-105'
                        }`}
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            {needsApproval ? 'Approving...' : 'Sending...'}
                          </>
                        ) : (
                          <>
                            <PaperAirplaneIcon className="w-5 h-5" />
                            {needsApproval ? 'Approve & Send' : 'Send'} ${amount} to {selectedReceiver.name}
                          </>
                        )}
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="card p-6"
              >
                <h3 className="font-bold text-neutral-900 mb-4">Why Choose RemesaPay?</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <ClockIcon className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-semibold text-sm">Instant Transfer</p>
                      <p className="text-xs text-neutral-600">Money arrives in seconds</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <BanknotesIcon className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-semibold text-sm">Low Fees</p>
                      <p className="text-xs text-neutral-600">Only 0.5% vs 15% traditional</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <GlobeAltIcon className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-semibold text-sm">Global Reach</p>
                      <p className="text-xs text-neutral-600">Send anywhere in the world</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Recent Transactions - Only show if there are transactions */}
              {transactions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="card p-6"
                >
                  <h3 className="font-bold text-neutral-900 mb-4">Recent Transactions</h3>
                  <div className="space-y-3">
                    {transactions.slice(0, 3).map((tx) => (
                      <div key={tx.id} className="flex justify-between items-center py-2">
                        <div>
                          <p className="font-semibold text-sm">{tx.recipient}</p>
                          <p className="text-xs text-neutral-600">{tx.date.toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">${tx.amount}</p>
                          <span className="status-success text-xs">
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Add Receiver Modal */}
          <AnimatePresence>
            {isAddingReceiver && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={() => setIsAddingReceiver(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="card p-6 max-w-md w-full"
                >
                  <h3 className="text-xl font-bold text-neutral-900 mb-4">Add New Receiver</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={newReceiverName}
                        onChange={(e) => setNewReceiverName(e.target.value)}
                        className="input-field"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          value={newReceiverPhone}
                          onChange={(e) => {
                            setNewReceiverPhone(e.target.value);
                            lookupUser(e.target.value);
                          }}
                          className="input-field"
                          placeholder="+1234567890"
                        />
                        {userLookup.loading && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <ArrowPathIcon className="w-4 h-4 animate-spin text-blue-600" />
                          </div>
                        )}
                      </div>
                      
                      {/* User lookup results */}
                      {userLookup.user && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 text-green-800">
                            <CheckCircleIcon className="w-4 h-4" />
                            <span className="font-semibold">User Found</span>
                          </div>
                          <div className="mt-2 text-sm text-green-700">
                            <p className="font-medium">{userLookup.user.name}</p>
                            <p>{userLookup.user.country}</p>
                          </div>
                        </div>
                      )}
                      
                      {userLookup.error && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center gap-2 text-yellow-800">
                            <ExclamationTriangleIcon className="w-4 h-4" />
                            <span className="font-semibold">User Not Registered</span>
                          </div>
                          <p className="mt-1 text-sm text-yellow-700">This phone number is not registered yet.</p>
                          <div className="mt-3 flex gap-2">
                            <button 
                              onClick={() => setShowInviteModal(true)}
                              className="text-xs bg-yellow-600 text-white px-3 py-1 rounded-md hover:bg-yellow-700 transition-colors"
                            >
                              Invite to Register
                            </button>
                            <button 
                              onClick={() => setShowManualEntryModal(true)}
                              className="text-xs bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors"
                            >
                              Enter Wallet Manually
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={() => setIsAddingReceiver(false)}
                      className="btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addReceiver}
                      disabled={!newReceiverName || !newReceiverPhone || !userLookup.user}
                      className="btn-primary flex-1 disabled:opacity-50"
                    >
                      {userLookup.user ? 'Add Receiver' : 'Enter Phone Number'}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Transaction Success Modal */}
          <AnimatePresence>
            {showTransactionModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                onClick={() => setShowTransactionModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-2xl p-8 max-w-md w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="text-center space-y-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircleIcon className="w-8 h-8 text-green-600" />
                    </div>
                    
                    <div>
                      <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                        Transaction Sent!
                      </h3>
                      <p className="text-neutral-600">
                        Your remittance has been successfully sent to the blockchain.
                      </p>
                    </div>

                    {txHash && (
                      <div className="bg-neutral-50 rounded-lg p-4">
                        <p className="text-sm text-neutral-600 mb-2">Transaction Hash:</p>
                        <p className="text-xs font-mono bg-white p-2 rounded border break-all">
                          {txHash}
                        </p>
                      </div>
                    )}

                    <div className="space-y-3">
                      {txHash && (
                        <a
                          href={`https://basescan.org/tx/${txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary w-full py-3 text-center block"
                        >
                          View on Explorer
                        </a>
                      )}
                      
                      <button
                        onClick={() => setShowTransactionModal(false)}
                        className="w-full py-3 px-4 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Custom Wallet Connection Modal */}
          <WalletConnectionModal 
            isOpen={showWalletModal}
            onClose={() => setShowWalletModal(false)}
          />

          {/* Manual Wallet Entry Modal */}
          <AnimatePresence>
            {showManualEntryModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                onClick={() => setShowManualEntryModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-xl p-6 max-w-md w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-xl font-bold mb-4">Enter Wallet Address Manually</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Since this phone number is not registered, you can manually enter the recipient's wallet address.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Wallet Address</label>
                      <input
                        type="text"
                        value={manualWalletAddress}
                        onChange={(e) => setManualWalletAddress(e.target.value)}
                        placeholder="0x..."
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setShowManualEntryModal(false)}
                      className="btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addReceiverManually}
                      disabled={!newReceiverName || !newReceiverPhone || !manualWalletAddress}
                      className="btn-primary flex-1 disabled:opacity-50"
                    >
                      Add Receiver
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Invite Modal */}
          <AnimatePresence>
            {showInviteModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                onClick={() => setShowInviteModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-xl p-6 max-w-md w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-xl font-bold mb-4">Invite to RemesaPay</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    This phone number ({newReceiverPhone}) is not registered with RemesaPay yet. 
                    Would you like to send them an invitation?
                  </p>
                  
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <p className="text-sm text-blue-800">
                      📱 We'll send an SMS with a link to register and set up their wallet address.
                    </p>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setShowInviteModal(false)}
                      className="btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        // TODO: Implement invite functionality
                        toast.success('Invitation sent!');
                        setShowInviteModal(false);
                      }}
                      className="btn-primary flex-1"
                    >
                      Send Invitation
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
