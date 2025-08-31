'use client';

import { motion } from 'framer-motion';
import { 
  ArrowRightIcon, 
  CurrencyDollarIcon,
  ClockIcon, 
  ShieldCheckIcon,
  CheckCircleIcon,
  StarIcon,
  GlobeAltIcon,
  BanknotesIcon,
  LockClosedIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import Layout from '@/components/Layout';

export default function HomePage() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-neutral-50 via-white to-blue-50 py-24">
        <div className="container-app">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* Trust Badge */}
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-sm shadow-sm flex items-center justify-center">
                  <GlobeAltIcon className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-semibold text-neutral-700">Global Money Transfers</span>
              </div>
              
              {/* Main Headline */}
              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-bold text-neutral-900 leading-tight">
                  <span className="text-gradient">
                    Send Money Fast
                  </span>
                </h1>
                <h2 className="text-3xl md:text-5xl font-bold text-neutral-700">
                  Anywhere, Anytime
                </h2>
              </div>
              
              {/* Description */}
              <p className="text-xl text-neutral-600 leading-relaxed max-w-lg">
                The fastest and most affordable way to send money globally. 
                Only 0.5% fees vs 15% traditional services.
              </p>

              {/* Trust Badge */}
              <div className="flex items-center space-x-4 p-6 bg-white rounded-2xl border border-green-200 shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <ShieldCheckIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <ClockIcon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <p className="font-bold text-green-800 text-lg">Families Connected</p>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className="w-3 h-3 text-amber-500 fill-current" />
                    ))}
                    <span className="text-sm text-green-700 ml-2 font-semibold">Perfect Rating</span>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/send" className="flex-1">
                  <button className="btn-primary w-full flex items-center justify-center gap-2">
                    Send Money Now
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </Link>
                
                <Link href="/calculator" className="flex-1">
                  <button className="btn-secondary w-full">
                    Calculate Savings
                  </button>
                </Link>
              </div>
            </motion.div>

            {/* Hero Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="relative max-w-lg mx-auto">
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="card p-8 hover:shadow-xl transition-all duration-500"
                >
                  <div className="text-center mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <CurrencyDollarIcon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-neutral-900 mb-2">Instant Transfer</h3>
                    <p className="text-neutral-600">Simplified Process</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl border border-green-200">
                      <span className="text-neutral-700 font-medium">Fee</span>
                      <span className="text-lg font-bold text-green-600">Minimal</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                      <span className="text-neutral-700 font-medium">Destination</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-neutral-600">Global</span>
                        <GlobeAltIcon className="w-5 h-5 text-neutral-500" />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Floating Globe Icon */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg z-10"
                >
                  <GlobeAltIcon className="w-5 h-5 text-white" />
                </motion.div>
                
                {/* Floating Check */}
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -bottom-2 -left-2 w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg z-10"
                >
                  <CheckCircleIcon className="w-4 h-4 text-white" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-20">
        <div className="container-app">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0 * 0.2 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="text-center p-8 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-lg border border-green-200"
            >
              <div className="text-4xl md:text-5xl font-bold text-green-600 mb-4">
                0.5%
              </div>
              <div className="text-lg font-semibold text-neutral-700">
                Ultra Low Fees
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 * 0.2 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="text-center p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg border border-blue-200"
            >
              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-4">
                {"<60s"}
              </div>
              <div className="text-lg font-semibold text-neutral-700">
                Instant Transfer
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2 * 0.2 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="text-center p-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-lg border border-purple-200"
            >
              <div className="text-4xl md:text-5xl font-bold text-purple-600 mb-4">
                $500M+
              </div>
              <div className="text-lg font-semibold text-neutral-700">
                Saved in Fees
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-neutral-50 to-blue-50">
        <div className="container-app">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">Why Choose RemesaPay?</h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              The most advanced platform for global money transfers
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0 * 0.2 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="card p-8"
            >
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg">
                <BanknotesIcon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">Ultra Low Fees</h3>
              <p className="text-neutral-600 leading-relaxed">Only 0.5% vs 10-15% traditional services</p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 * 0.2 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="card p-8"
            >
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg">
                <ClockIcon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">Instant Transfers</h3>
              <p className="text-neutral-600 leading-relaxed">Your money arrives in less than 60 seconds</p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2 * 0.2 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="card p-8"
            >
              <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg">
                <LockClosedIcon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">Maximum Security</h3>
              <p className="text-neutral-600 leading-relaxed">Protected by blockchain and audited smart contracts</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-20">
        <div className="container-app">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Send money globally in three simple steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Enter Amount</h3>
              <p className="text-neutral-600">Choose how much you want to send and select your recipient</p>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Confirm Transfer</h3>
              <p className="text-neutral-600">Review details and confirm your transaction securely</p>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Money Delivered</h3>
              <p className="text-neutral-600">Recipient receives funds instantly via digital wallet</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-700 py-20">
        <div className="container-app">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Send Money?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of users who save money on every transfer
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Link href="/send" className="flex-1">
                <button className="w-full bg-neutral-800 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 hover:bg-neutral-700 shadow-lg hover:shadow-xl">
                  Start Sending
                </button>
              </Link>
              <Link href="/test-transaction" className="flex-1">
                <button className="w-full border-2 border-white text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 hover:bg-white/10">
                  Test Transaction
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
