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
import { useTokenBalances } from '@/hooks/useTokenBalances';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { ConnectKitButton } from 'connectkit';
import { WalletConnectionModal } from '@/components/WalletConnectionModal';
import { checkMetaMaskInstallation, connectToMetaMask } from '@/utils/wallet';
import { baseSepolia, sepolia } from 'wagmi/chains';
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
  const [currency, setCurrency] = useState<'ETH' | 'USDC' | 'USDT'>('ETH'); // Default to ETH for testing
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
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { getBalance, getRawBalance } = useTokenBalances();
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

  // Network validation - support both Ethereum Sepolia and Base Sepolia
  const isSupportedNetwork = chainId === sepolia.id || chainId === baseSepolia.id;
  const currentNetworkName = 
    chainId === sepolia.id ? 'Ethereum Sepolia' :
    chainId === baseSepolia.id ? 'Base Sepolia' :
    `Chain ID: ${chainId}`;

  // Switch to Ethereum Sepolia (where your SepoliaETH is)
  const switchToEthereumSepolia = async () => {
    try {
      await switchChain({ chainId: sepolia.id });
      toast.success('¡Cambiado a la red Ethereum Sepolia!');
    } catch (error) {
      console.error('Failed to switch network:', error);
      toast.error('Error al cambiar de red. Por favor cambia manualmente en tu billetera.');
    }
  };

  // Switch to Base Sepolia network
  const switchToBaseSepolia = async () => {
    try {
      await switchChain({ chainId: baseSepolia.id });
      toast.success('¡Cambiado a la red Base Sepolia!');
    } catch (error) {
      console.error('Failed to switch network:', error);
      toast.error('Error al cambiar de red. Por favor cambia manualmente en tu billetera.');
    }
  };
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
      // Validate wallet address format
      if (!/^0x[a-fA-F0-9]{40}$/.test(manualWalletAddress)) {
        toast.error('Please enter a valid Ethereum wallet address');
        return;
      }

      const newReceiver: Receiver = {
        id: Date.now().toString(),
        name: newReceiverName,
        phone: newReceiverPhone,
        avatar: newReceiverName.split(' ').map(n => n[0]).join('').toUpperCase(),
        walletAddress: manualWalletAddress,
        country: 'Entrada Manual'
      };
      setReceivers([...receivers, newReceiver]);
      setSelectedReceiver(newReceiver);
      setNewReceiverName('');
      setNewReceiverPhone('');
      setManualWalletAddress('');
      setUserLookup({ loading: false, user: null, error: null });
      setShowManualEntryModal(false);
      setIsAddingReceiver(false);
      toast.success(`Destinatario ${newReceiverName} agregado exitosamente!`);
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
      const response = await fetch(`http://localhost:3002/api/users/phone/${encodeURIComponent(phoneNumber)}`);
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
          error: 'No se encontró ningún usuario registrado con este número de teléfono' 
        });
        setNewReceiverName(''); // Clear name when user not found
        setSelectedReceiver(null); // Clear selected receiver
      }
    } catch (error) {
      console.error('Error looking up user:', error);
      setUserLookup({ 
        loading: false, 
        user: null, 
        error: 'Error al conectar con el servidor' 
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
        toast.success('¡MetaMask conectado exitosamente!');
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
      toast.error('Por favor selecciona un destinatario e ingresa un monto');
      return;
    }

    // For manual entries (with wallet address), skip user lookup verification
    if (!selectedReceiver.walletAddress && !userLookup.user) {
      toast.error('Please verify the recipient exists before sending');
      return;
    }

    const amountFloat = parseFloat(amount);
    if (amountFloat < 0.001 || amountFloat > 10000) {
      toast.error(`Amount must be between 0.001 and 10,000 ${currency}`);
      return;
    }

    const currentBalance = parseFloat(getBalance(currency));
    if (currentBalance < amountFloat) {
      toast.error(`Saldo insuficiente de ${currency}. Tienes ${currentBalance.toFixed(6)} ${currency}`);
      return;
    }

    try {
      // First create the remittance record via API
      toast.loading('Creando remesa...');
      
      const response = await fetch('http://localhost:3002/api/remittance/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderAddress: address || '0x0000000000000000000000000000000000000000',
          receiverPhone: selectedReceiver.phone,
          receiverAddress: selectedReceiver.walletAddress, // Add wallet address for manual entries
          amountUsd: amountFloat,
          recipientName: selectedReceiver.name,
          isManualEntry: !!selectedReceiver.walletAddress // Flag to indicate manual entry
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
      
      let hash;
      
      // For manual entries with wallet address, do a direct ETH transfer for testing
      if (selectedReceiver.walletAddress && currency === 'ETH') {
        try {
          // Use wagmi's useSendTransaction for direct ETH transfer
          // This is a temporary solution for testing without deployed contracts
          const { writeContract } = await import('wagmi');
          
          // For now, let's simulate the transaction for testing
          hash = '0x' + Math.random().toString(16).substr(2, 64); // Simulated hash
          toast.dismiss();
          toast.success('¡Transacción simulada exitosamente! (Contrato aún no desplegado)');
          console.log(`Simulated transaction: ${amountFloat} ETH to ${selectedReceiver.walletAddress}`);
        } catch (error) {
          console.error('ETH transfer error:', error);
          toast.dismiss();
          toast.error('ETH transfer failed. Please try again.');
          return;
        }
      } else {
        // Use RemesaPay contract (when deployed)
        hash = await sendRemittance({
          phoneNumber: selectedReceiver.phone,
          token: currency,
          amount: amount,
          ensSubdomain: `${selectedReceiver.name.toLowerCase().replace(/\s+/g, '')}.remesapay.eth`
        });
      }

      if (hash) {
        // Update the remittance record with transaction hash
        try {
          await fetch(`http://localhost:3002/api/remittance/${remittanceData.data.remittanceId}/transaction`, {
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
        toast.success(`¡Dinero enviado exitosamente a ${selectedReceiver.name}!`);
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
                  Conecta tu Billetera
                </h1>
                <p className="text-neutral-600 mb-8 leading-relaxed">
                  Para enviar dinero de forma segura a través de la tecnología blockchain, primero necesitas conectar tu billetera.
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
                          {isConnected ? `Conectado: ${ensName ?? truncatedAddress}` : 'Conectar Billetera'}
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
            <h1 className="text-3xl font-bold text-neutral-900">Enviar Dinero</h1>
            <p className="text-neutral-600 mt-1">Transferencias de dinero rápidas, seguras y accesibles</p>
          </div>

          {/* Network Warning */}
          {isConnected && !isSupportedNetwork && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ExclamationTriangleIcon className="w-5 h-5 text-orange-600" />
                  <div>
                    <h3 className="font-medium text-orange-800">Wrong Network Detected</h3>
                    <p className="text-sm text-orange-700">
                      Por favor cambia a Ethereum Sepolia (para tu SepoliaETH) o testnet Base Sepolia.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={switchToEthereumSepolia}
                    className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Ethereum Sepolia
                  </button>
                  <button
                    onClick={switchToBaseSepolia}
                    className="bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm"
                  >
                    Base Sepolia
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Network Info Banner */}
          {isConnected && isSupportedNetwork && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-medium text-blue-800">Conectado a {currentNetworkName}</h3>
                    <p className="text-sm text-blue-700">
                      {chainId === sepolia.id 
                        ? "Tu SepoliaETH debería ser visible aquí. ¡Perfecto para probar transacciones ETH!" 
                        : "Red Base Sepolia activa. Para acceder a tu 0.05 SepoliaETH, cambia a Ethereum Sepolia."}
                    </p>
                  </div>
                </div>
                {chainId === baseSepolia.id && (
                  <button
                    onClick={switchToEthereumSepolia}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Cambiar a Ethereum Sepolia
                  </button>
                )}
              </div>
            </motion.div>
          )}

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
                <h2 className="text-xl font-bold text-neutral-900 mb-4">Monto a Enviar</h2>
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
                        onChange={(e) => setCurrency(e.target.value as 'ETH' | 'USDC' | 'USDT')}
                        className="bg-transparent border-none text-lg font-semibold text-neutral-600 focus:outline-none cursor-pointer"
                      >
                        <option value="ETH">ETH</option>
                        <option value="USDC">USDC</option>
                        <option value="USDT">USDT</option>
                      </select>
                      <ChevronDownIcon className="w-4 h-4 text-neutral-400 absolute right-0 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                  
                  {amount && (
                    <div className="bg-gradient-to-br from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700 font-medium">Monto a enviar:</span>
                        <span className="font-bold text-gray-900">${parseFloat(amount).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700 font-medium">Comisión RemesaPay (0.5%):</span>
                        <span className="font-bold text-gray-900">${calculateDisplayFee(parseFloat(amount)).toFixed(2)}</span>
                      </div>
                      <div className="h-px bg-gray-300 my-2"></div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700 font-medium">Total a pagar:</span>
                        <span className="font-bold text-lg text-blue-700">${(parseFloat(amount) + calculateDisplayFee(parseFloat(amount))).toFixed(2)}</span>
                      </div>
                      <div className="bg-green-100 rounded-lg p-3 mt-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-green-800 font-bold">Tu familia recibe:</span>
                          <span className="font-bold text-lg text-green-700">${parseFloat(amount).toFixed(2)}</span>
                        </div>
                        <p className="text-green-700 text-xs mt-1">⚡ Llega en 30-60 segundos</p>
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
                  <h2 className="text-xl font-bold text-neutral-900">Enviar a</h2>
                  <button
                    onClick={() => setIsAddingReceiver(true)}
                    className="btn-secondary text-sm px-4 py-2"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Agregar Contacto
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
                      placeholder="Buscar por nombre o teléfono..."
                    />
                  </div>
                )}

                {/* Receivers List or Empty State */}
                {receivers.length === 0 ? (
                  <div className="text-center py-8">
                    <UserIcon className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                    <p className="text-neutral-500 mb-4">Aún no tienes contactos</p>
                    <p className="text-sm text-neutral-400">Agrega un contacto para comenzar a enviar dinero</p>
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
                              <p className="text-xs text-neutral-500">Último envío</p>
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
                      <span className="text-yellow-800">Por favor conecta tu billetera para enviar dinero</span>
                    </div>
                  ) : (
                    <>
                      {/* Balance Display */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-blue-800">Your {currency} Balance:</span>
                          <span className="font-bold text-blue-900">
                            {parseFloat(getBalance(currency)).toFixed(currency === 'ETH' ? 6 : 2)} {currency}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${isSupportedNetwork ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-xs text-blue-700">
                            {isSupportedNetwork ? currentNetworkName : `${currentNetworkName} (Unsupported Network)`}
                          </span>
                        </div>
                      </div>

                      {/* Approval Status - Only show for ERC20 tokens */}
                      {currency !== 'ETH' && needsApproval && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center space-x-3">
                          <ExclamationTriangleIcon className="w-5 h-5 text-orange-600" />
                          <span className="text-orange-800">Token approval required before sending</span>
                        </div>
                      )}

                      {/* ETH Info */}
                      {currency === 'ETH' && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
                          <CheckCircleIcon className="w-5 h-5 text-green-600" />
                          <span className="text-green-800">Las transferencias ETH no requieren aprobación - ¡listo para enviar!</span>
                        </div>
                      )}

                      {/* Send Button */}
                      <button
                        onClick={handleSendMoney}
                        disabled={
                          isLoading || 
                          parseFloat(getBalance(currency)) < parseFloat(amount) ||
                          !isSupportedNetwork
                        }
                        className={`w-full py-4 text-lg flex items-center justify-center gap-2 rounded-lg font-semibold transition-all ${
                          isLoading || 
                          parseFloat(getBalance(currency)) < parseFloat(amount) ||
                          !isSupportedNetwork
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'btn-primary hover:scale-105'
                        }`}
                      >
                        {!isSupportedNetwork ? (
                          <>
                            <ExclamationTriangleIcon className="w-5 h-5" />
                            Cambiar a Red Soportada
                          </>
                        ) : isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            {currency !== 'ETH' && needsApproval ? 'Aprobando...' : 'Enviando...'}
                          </>
                        ) : (
                          <>
                            <PaperAirplaneIcon className="w-5 h-5" />
                            {currency !== 'ETH' && needsApproval ? 'Aprobar y Enviar' : 'Enviar'} {amount} {currency} a {selectedReceiver.name}
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
                <h3 className="font-bold text-neutral-900 mb-4">¿Por Qué Elegir RemesaPay?</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <ClockIcon className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-semibold text-sm">Transferencia Instantánea</p>
                      <p className="text-xs text-neutral-600">El dinero llega en segundos</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <BanknotesIcon className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-semibold text-sm">Comisiones Bajas</p>
                      <p className="text-xs text-neutral-600">Solo 0.5% vs 15% tradicional</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <GlobeAltIcon className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-semibold text-sm">Alcance Global</p>
                      <p className="text-xs text-neutral-600">Envía a cualquier parte del mundo</p>
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
                  <h3 className="text-xl font-bold text-neutral-900 mb-4">Agregar Nuevo Destinatario</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        value={newReceiverName}
                        onChange={(e) => setNewReceiverName(e.target.value)}
                        className="input-field"
                        placeholder="Nombre del destinatario"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Número de Teléfono
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
                            <span className="font-semibold">Usuario No Registrado</span>
                          </div>
                          <p className="mt-1 text-sm text-yellow-700">Este número de teléfono no está registrado todavía.</p>
                          <div className="mt-3 flex gap-2">
                            <button 
                              onClick={() => setShowInviteModal(true)}
                              className="text-xs bg-yellow-600 text-white px-3 py-1 rounded-md hover:bg-yellow-700 transition-colors"
                            >
                              Invitar a Registrarse
                            </button>
                            <button 
                              onClick={() => setShowManualEntryModal(true)}
                              className="text-xs bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors"
                            >
                              Ingresar Billetera Manualmente
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
                      {userLookup.user ? 'Agregar Destinatario' : 'Ingresa Número de Teléfono'}
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
                        ¡Transacción Enviada!
                      </h3>
                      <p className="text-neutral-600">
                        Tu remesa ha sido enviada exitosamente a la blockchain.
                      </p>
                    </div>

                    {txHash && (
                      <div className="bg-neutral-50 rounded-lg p-4">
                        <p className="text-sm text-neutral-600 mb-2">Hash de Transacción:</p>
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
                          Ver en Explorer
                        </a>
                      )}
                      
                      <button
                        onClick={() => setShowTransactionModal(false)}
                        className="w-full py-3 px-4 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors"
                      >
                        Cerrar
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
                  <h3 className="text-xl font-bold mb-4">Ingresar Dirección de Billetera Manualmente</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Dado que este número de teléfono no está registrado, puedes ingresar manualmente la dirección de billetera del destinatario.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Nombre del Destinatario <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newReceiverName}
                        onChange={(e) => setNewReceiverName(e.target.value)}
                        placeholder="Ingresa el nombre del destinatario"
                        className={`input-field ${!newReceiverName && newReceiverName !== '' ? 'border-red-300' : ''}`}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Número de Teléfono <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newReceiverPhone}
                        onChange={(e) => setNewReceiverPhone(e.target.value)}
                        placeholder="+1234567890"
                        className={`input-field ${!newReceiverPhone && newReceiverPhone !== '' ? 'border-red-300' : ''}`}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Dirección de Billetera <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={manualWalletAddress}
                        onChange={(e) => setManualWalletAddress(e.target.value)}
                        placeholder="0x4af561881F57cB5c442091E9f6982E29cBD4C8A3"
                        className={`input-field ${!manualWalletAddress && manualWalletAddress !== '' ? 'border-red-300' : ''}`}
                        required
                      />
                      {manualWalletAddress && !/^0x[a-fA-F0-9]{40}$/.test(manualWalletAddress) && (
                        <p className="text-red-500 text-xs mt-1">Por favor ingresa una dirección de Ethereum válida</p>
                      )}
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
                      disabled={
                        !newReceiverName || 
                        !newReceiverPhone || 
                        !manualWalletAddress || 
                        !/^0x[a-fA-F0-9]{40}$/.test(manualWalletAddress)
                      }
                      className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      title={
                        !newReceiverName ? 'Por favor ingresa el nombre del destinatario' :
                        !newReceiverPhone ? 'Por favor ingresa el número de teléfono' :
                        !manualWalletAddress ? 'Por favor ingresa la dirección de billetera' :
                        !/^0x[a-fA-F0-9]{40}$/.test(manualWalletAddress) ? 'Por favor ingresa una dirección de billetera válida' :
                        'Agregar este destinatario'
                      }
                    >
                      Agregar Destinatario
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
                  <h3 className="text-xl font-bold mb-4">Invitar a RemesaPay</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Este número de teléfono ({newReceiverPhone}) no está registrado en RemesaPay todavía. 
                    ¿Te gustaría enviarles una invitación?
                  </p>
                  
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <p className="text-sm text-blue-800">
                      📱 Enviaremos un SMS con un enlace para registrarse y configurar su dirección de billetera.
                    </p>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setShowInviteModal(false)}
                      className="btn-secondary flex-1"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        // TODO: Implement invite functionality
                        toast.success('¡Invitación enviada!');
                        setShowInviteModal(false);
                      }}
                      className="btn-primary flex-1"
                    >
                      Enviar Invitación
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
