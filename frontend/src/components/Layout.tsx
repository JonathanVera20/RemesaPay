'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRightIcon,
  LanguageIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { WalletConnect } from '@/components/WalletConnect';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isSpanish, setIsSpanish] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);

  const handleWalletConnect = (address: string) => {
    setConnectedWallet(address);
  };

  const navigation = {
    es: [
      { name: 'Inicio', href: '/' },
      { name: 'Enviar Dinero', href: '/send' },
      { name: 'Calculadora', href: '/calculator' },
      { name: 'Cómo Funciona', href: '/how-it-works' },
      { name: 'Soporte', href: '/support' }
    ],
    en: [
      { name: 'Home', href: '/' },
      { name: 'Send Money', href: '/send' },
      { name: 'Calculator', href: '/calculator' },
      { name: 'How It Works', href: '/how-it-works' },
      { name: 'Support', href: '/support' }
    ]
  };

  const nav = navigation[isSpanish ? 'es' : 'en'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-40 h-40 bg-yellow-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-60 h-60 bg-blue-500/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-red-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -top-10 left-1/2 w-96 h-96 bg-gradient-to-r from-yellow-400/5 to-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Enhanced Header */}
      <header className="backdrop-blur-xl bg-white/95 border-b border-gray-200/50 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-6 py-4">
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
                  <div className="w-12 h-12 gradient-ecuador rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">R</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gradient-ecuador">RemesaPay</h1>
                  <p className="text-sm text-gray-600 font-medium">Para Ecuador 🇪🇨</p>
                </div>
              </Link>
            </motion.div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {nav.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="logo-text text-gray-700 hover:text-blue-600 font-semibold transition-all duration-300 hover:scale-105 transform px-4 py-2 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-teal-50"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-4">
              {/* Language Toggle */}
              <motion.button 
                onClick={() => setIsSpanish(!isSpanish)}
                className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-300 border border-gray-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LanguageIcon className="w-4 h-4" />
                <span className="text-sm font-medium">{isSpanish ? '🇪🇸 ES' : '🇺🇸 EN'}</span>
              </motion.button>
              
              {/* Wallet Connect */}
              <div className="hidden md:block">
                <WalletConnect onConnect={handleWalletConnect} />
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden mt-4 pb-4 border-t border-gray-200"
            >
              <div className="flex flex-col space-y-4 pt-4">
                {nav.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-gray-700 hover:text-blue-600 font-medium py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="pt-4 border-t border-gray-200">
                  <WalletConnect onConnect={handleWalletConnect} />
                </div>
              </div>
            </motion.div>
          )}

          {/* Connected Wallet Indicator */}
          {connectedWallet && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center justify-center space-x-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-800">
                Conectado: {connectedWallet.substring(0, 6)}...{connectedWallet.substring(-4)}
              </span>
            </motion.div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        {children}
      </main>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-16 relative z-10">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 gradient-ecuador rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">R</span>
                </div>
                <span className="text-2xl font-bold">RemesaPay</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                La revolución en remesas para Ecuador. Rápido, seguro y económico.
              </p>
              <div className="flex space-x-4 mt-6">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-bold">f</span>
                </div>
                <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-bold">t</span>
                </div>
                <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-bold">i</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-lg">Producto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/how-it-works" className="hover:text-white transition-colors">Cómo funciona</Link></li>
                <li><Link href="/calculator" className="hover:text-white transition-colors">Calculadora</Link></li>
                <li><Link href="/security" className="hover:text-white transition-colors">Seguridad</Link></li>
                <li><Link href="/api" className="hover:text-white transition-colors">API</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-lg">Soporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Email: soporte@remesapay.com</li>
                <li>WhatsApp: +593 99 999 9999</li>
                <li>Horario: 24/7</li>
                <li><Link href="/support" className="hover:text-white transition-colors">Centro de ayuda</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-lg">Tecnología</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-blue-500 rounded"></div>
                  <span className="text-gray-400">Base Network</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-purple-500 rounded"></div>
                  <span className="text-gray-400">Ethereum</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 gradient-ecuador rounded"></div>
                  <span className="text-gray-400">Smart Contracts</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 RemesaPay Ecuador. Todos los derechos reservados.</p>
            <p className="mt-2">Hecho con ❤️ para la comunidad ecuatoriana</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
