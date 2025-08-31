'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRightIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  UserIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import Layout from '@/components/Layout';

export default function TestTransactionPage() {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('100');
  const [recipient, setRecipient] = useState('');
  const [phone, setPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  const handleStartTest = () => {
    setIsProcessing(true);
    // Simulate transaction processing
    setTimeout(() => {
      setTransactionId(`TEST-${Date.now()}`);
      setStep(2);
      setIsProcessing(false);
    }, 3000);
  };

  const resetTest = () => {
    setStep(1);
    setAmount('100');
    setRecipient('');
    setPhone('');
    setIsProcessing(false);
    setTransactionId('');
  };

  return (
    <Layout>
      <div className="py-20 bg-gradient-to-br from-neutral-50 to-blue-50 min-h-screen">
        <div className="container-app">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
                Test Transaction
              </h1>
              <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
                Try our platform with a simulated transaction to see how fast and easy it is
              </p>
            </div>

            {/* Progress Steps */}
            <div className="flex justify-center mb-12">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                  step >= 1 ? 'bg-blue-600 text-white' : 'bg-neutral-200 text-neutral-500'
                }`}>
                  1
                </div>
                <div className={`w-16 h-1 transition-all duration-300 ${
                  step >= 2 ? 'bg-blue-600' : 'bg-neutral-200'
                }`}></div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                  step >= 2 ? 'bg-green-600 text-white' : 'bg-neutral-200 text-neutral-500'
                }`}>
                  2
                </div>
              </div>
            </div>

            {/* Step 1: Setup */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-2xl mx-auto"
              >
                <div className="card p-8">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-6 text-center">
                    Setup Test Transaction
                  </h2>
                  
                  <div className="space-y-6">
                    {/* Amount Input */}
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Amount to Send (USD)
                      </label>
                      <div className="relative">
                        <CurrencyDollarIcon className="w-5 h-5 text-neutral-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="input-field pl-10"
                          placeholder="100"
                        />
                      </div>
                    </div>

                    {/* Recipient Name */}
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Recipient Name
                      </label>
                      <div className="relative">
                        <UserIcon className="w-5 h-5 text-neutral-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                          type="text"
                          value={recipient}
                          onChange={(e) => setRecipient(e.target.value)}
                          className="input-field pl-10"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Recipient Phone
                      </label>
                      <div className="relative">
                        <PhoneIcon className="w-5 h-5 text-neutral-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="input-field pl-10"
                          placeholder="+1234567890"
                        />
                      </div>
                    </div>

                    {/* Transaction Preview */}
                    <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
                      <h3 className="font-semibold text-neutral-900 mb-4">Transaction Preview</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Send Amount:</span>
                          <span className="font-semibold text-neutral-900">${amount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Fee (0.5%):</span>
                          <span className="font-semibold text-neutral-900">${(parseFloat(amount) * 0.005).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Recipient Receives:</span>
                          <span className="font-semibold text-neutral-900">${(parseFloat(amount) - (parseFloat(amount) * 0.005)).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t border-neutral-200 pt-3">
                          <span className="text-neutral-600">Delivery Time:</span>
                          <span className="font-semibold text-green-600">Instant</span>
                        </div>
                      </div>
                    </div>

                    {/* Start Test Button */}
                    <button
                      onClick={handleStartTest}
                      disabled={!amount || !recipient || !phone || isProcessing}
                      className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? (
                        <>
                          <ClockIcon className="w-5 h-5 animate-spin" />
                          Processing Test Transaction...
                        </>
                      ) : (
                        <>
                          Start Test Transaction
                          <ArrowRightIcon className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Success */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-2xl mx-auto"
              >
                <div className="card p-8 text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircleIcon className="w-10 h-10 text-green-600" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                    Test Transaction Successful!
                  </h2>
                  
                  <p className="text-neutral-600 mb-8">
                    Your test transaction has been completed successfully. This is how fast real transactions work on RemesaPay.
                  </p>

                  {/* Transaction Details */}
                  <div className="bg-green-50 rounded-xl p-6 border border-green-200 mb-8 text-left">
                    <h3 className="font-semibold text-green-900 mb-4">Transaction Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-green-700">Transaction ID:</span>
                        <span className="font-mono text-green-900">{transactionId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Amount Sent:</span>
                        <span className="font-semibold text-green-900">${amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Recipient:</span>
                        <span className="font-semibold text-green-900">{recipient}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Phone:</span>
                        <span className="font-semibold text-green-900">{phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Status:</span>
                        <span className="font-semibold text-green-900">Completed</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Processing Time:</span>
                        <span className="font-semibold text-green-900">3 seconds</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={resetTest}
                      className="btn-secondary flex-1"
                    >
                      Try Another Test
                    </button>
                    <a
                      href="/send"
                      className="btn-primary flex-1 text-center"
                    >
                      Send Real Money
                    </a>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Information Cards */}
            <div className="grid md:grid-cols-3 gap-6 mt-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="card p-6 text-center"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <ClockIcon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-neutral-900 mb-2">Instant Processing</h3>
                <p className="text-neutral-600 text-sm">Real transactions complete in under 60 seconds</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="card p-6 text-center"
              >
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-bold text-neutral-900 mb-2">Low Fees</h3>
                <p className="text-neutral-600 text-sm">Only 0.5% transaction fee vs 15% traditional services</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="card p-6 text-center"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <GlobeAltIcon className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-bold text-neutral-900 mb-2">Global Reach</h3>
                <p className="text-neutral-600 text-sm">Send money anywhere in the world instantly</p>
              </motion.div>
            </div>

            {/* Warning Note */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12"
            >
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <ExclamationTriangleIcon className="w-6 h-6 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-amber-900 mb-2">Test Mode Notice</h4>
                    <p className="text-amber-800 text-sm leading-relaxed">
                      This is a demonstration of our platform. No real money is being transferred. 
                      For actual transactions, you'll need to connect your wallet and use real cryptocurrency.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
