'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRightIcon,
  LanguageIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useAccount, useDisconnect } from 'wagmi';
import { WalletConnectionModal } from './WalletConnectionModal';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isSpanish, setIsSpanish] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Send Money', href: '/send' },
    { name: 'Calculator', href: '/calculator' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'Test Transaction', href: '/test-transaction' },
    { name: 'Support', href: '/support' }
  ];

  return (
    <div className="min-h-screen-safe bg-neutral-50 relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-40 h-40 bg-blue-500/5 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-10 w-60 h-60 bg-blue-500/3 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-blue-500/2 rounded-full blur-3xl"></div>
      </div>

      {/* Professional Header */}
      <header className="backdrop-blur-xl bg-white/95 border-b border-neutral-200/50 sticky top-0 z-50 shadow-sm">
        <div className="container-app py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Link href="/" className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">R</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gradient">RemesaPay</h1>
                  <p className="text-sm text-neutral-600 font-medium">Global Transfers</p>
                </div>
              </Link>
            </motion.div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-neutral-700 hover:text-blue-600 font-semibold transition-all duration-300 hover:scale-105 transform px-4 py-2 rounded-lg hover:bg-blue-50"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-4">
              {/* Connect Wallet Button */}
              {isConnected ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm font-medium text-green-800">
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </span>
                  </div>
                  <button
                    onClick={() => disconnect()}
                    className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowWalletModal(true)}
                  className="btn-primary text-sm px-4 py-2 flex items-center space-x-2"
                >
                  <span>Connect Wallet</span>
                </button>
              )}
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6 text-neutral-700" />
                ) : (
                  <Bars3Icon className="w-6 h-6 text-neutral-700" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-neutral-200"
            >
              <div className="container-app py-4">
                <div className="flex flex-col space-y-2">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-neutral-700 hover:text-blue-600 font-semibold py-3 px-4 rounded-lg hover:bg-blue-50 transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Professional Footer */}
      <footer className="bg-neutral-900 text-white py-16">
        <div className="container-app">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gradient">RemesaPay</h3>
              <p className="text-neutral-400 leading-relaxed">
                The fastest and most secure way to send money globally.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Product</h4>
              <div className="space-y-2">
                <Link href="/send" className="block text-neutral-400 hover:text-white transition-colors">Send Money</Link>
                <Link href="/calculator" className="block text-neutral-400 hover:text-white transition-colors">Calculator</Link>
                <Link href="/test-transaction" className="block text-neutral-400 hover:text-white transition-colors">Test Transaction</Link>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Support</h4>
              <div className="space-y-2">
                <Link href="/how-it-works" className="block text-neutral-400 hover:text-white transition-colors">How It Works</Link>
                <Link href="/support" className="block text-neutral-400 hover:text-white transition-colors">Help Center</Link>
                <Link href="/contact" className="block text-neutral-400 hover:text-white transition-colors">Contact Us</Link>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Legal</h4>
              <div className="space-y-2">
                <Link href="/privacy" className="block text-neutral-400 hover:text-white transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="block text-neutral-400 hover:text-white transition-colors">Terms of Service</Link>
                <Link href="/security" className="block text-neutral-400 hover:text-white transition-colors">Security</Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-neutral-700 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-neutral-400">
                © 2024 RemesaPay. All rights reserved.
              </p>
              {isConnected && address && (
                <div className="text-sm text-neutral-400">
                  Connected: {address.slice(0, 6)}...{address.slice(-4)}
                </div>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* Wallet Connection Modal */}
      <WalletConnectionModal 
        isOpen={showWalletModal} 
        onClose={() => setShowWalletModal(false)} 
      />
    </div>
  );
}
