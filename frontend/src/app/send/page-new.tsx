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
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import Layout from '@/components/Layout';

interface Receiver {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  lastSent?: Date;
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
  const [currency, setCurrency] = useState<'USD' | 'EUR'>('USD');
  const [newReceiverPhone, setNewReceiverPhone] = useState('');
  const [newReceiverName, setNewReceiverName] = useState('');
  const [isAddingReceiver, setIsAddingReceiver] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const [receivers, setReceivers] = useState<Receiver[]>([
    { 
      id: '1', 
      name: 'John Smith', 
      phone: '+1234567890',
      avatar: 'JS',
      lastSent: new Date('2024-01-15')
    },
    { 
      id: '2', 
      name: 'Maria Garcia', 
      phone: '+1987654321',
      avatar: 'MG',
      lastSent: new Date('2024-01-10')
    },
    { 
      id: '3', 
      name: 'David Chen', 
      phone: '+1122334455',
      avatar: 'DC',
      lastSent: new Date('2024-01-08')
    }
  ]);

  const [transactions] = useState<Transaction[]>([
    {
      id: 'tx1',
      amount: 500,
      fee: 2.5,
      recipient: 'John Smith',
      status: 'completed',
      date: new Date('2024-01-15'),
      txHash: '0x1234...5678'
    },
    {
      id: 'tx2', 
      amount: 200,
      fee: 1.0,
      recipient: 'Maria Garcia',
      status: 'completed',
      date: new Date('2024-01-10')
    }
  ]);

  const calculateFee = (amount: number) => amount * 0.005;
  const calculateTotal = (amount: number) => amount * 1.005;
  const calculateReceives = (amount: number) => amount - calculateFee(amount);

  const addReceiver = () => {
    if (newReceiverName && newReceiverPhone) {
      const newReceiver: Receiver = {
        id: Date.now().toString(),
        name: newReceiverName,
        phone: newReceiverPhone,
        avatar: newReceiverName.split(' ').map(n => n[0]).join('').toUpperCase()
      };
      setReceivers([...receivers, newReceiver]);
      setSelectedReceiver(newReceiver);
      setNewReceiverName('');
      setNewReceiverPhone('');
      setIsAddingReceiver(false);
    }
  };

  const filteredReceivers = receivers.filter(receiver =>
    receiver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receiver.phone.includes(searchTerm)
  );

  const handleSendMoney = () => {
    // This would integrate with your smart contract
    alert('Transaction would be processed here with smart contract integration');
  };

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
                    <CurrencyDollarIcon className="w-5 h-5 text-neutral-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="input-field pl-10 text-2xl"
                      placeholder="0.00"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <select 
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value as 'USD' | 'EUR')}
                        className="bg-transparent border-none text-lg font-semibold text-neutral-600 focus:outline-none"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                      </select>
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
                        <span className="font-semibold">${calculateFee(parseFloat(amount)).toFixed(2)}</span>
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

                {/* Search */}
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

                {/* Receivers List */}
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
              </motion.div>

              {/* Send Button */}
              {amount && selectedReceiver && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <button
                    onClick={handleSendMoney}
                    className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
                  >
                    <PaperAirplaneIcon className="w-5 h-5" />
                    Send ${amount} to {selectedReceiver.name}
                  </button>
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

              {/* Recent Transactions */}
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
                      <input
                        type="tel"
                        value={newReceiverPhone}
                        onChange={(e) => setNewReceiverPhone(e.target.value)}
                        className="input-field"
                        placeholder="+1234567890"
                      />
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
                      disabled={!newReceiverName || !newReceiverPhone}
                      className="btn-primary flex-1 disabled:opacity-50"
                    >
                      Add Receiver
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
