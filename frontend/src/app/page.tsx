'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRightIcon, 
  BanknotesIcon, 
  ClockIcon, 
  ShieldCheckIcon,
  MapPinIcon,
  PhoneIcon,
  CheckCircleIcon,
  StarIcon,
  GlobeAltIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { WalletConnect } from '@/components/WalletConnect';

export default function LandingPage() {
  const [amount, setAmount] = useState('100');
  const [isSpanish, setIsSpanish] = useState(true);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);

  const handleWalletConnect = (address: string) => {
    setConnectedWallet(address);
  };

  const text = {
    es: {
      hero: {
        title: "Envía dinero a Ecuador",
        subtitle: "en segundos, no días",
        description: "La forma más rápida y económica de enviar dinero a tu familia en Ecuador. 0.5% de comisión vs 15% de Western Union.",
        cta: "Enviar Dinero Ahora",
        secured: "Asegurado por Blockchain",
        instant: "Transferencias Instantáneas"
      },
      stats: {
        fee: "0.5%",
        feeLabel: "Comisión",
        time: "<60s",
        timeLabel: "Tiempo de envío",
        saved: "$500M+",
        savedLabel: "Ahorrado a familias"
      }
    },
    en: {
      hero: {
        title: "Send money to Ecuador",
        subtitle: "in seconds, not days", 
        description: "The fastest and cheapest way to send money to your family in Ecuador. 0.5% fee vs 15% Western Union.",
        cta: "Send Money Now",
        secured: "Secured by Blockchain",
        instant: "Instant Transfers"
      },
      stats: {
        fee: "0.5%",
        feeLabel: "Fee",
        time: "<60s", 
        timeLabel: "Transfer time",
        saved: "$500M+",
        savedLabel: "Saved for families"
      }
    }
  };

  const t = text[isSpanish ? 'es' : 'en'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-40 h-40 bg-yellow-400/20 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-10 w-60 h-60 bg-blue-500/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-red-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -top-10 left-1/2 w-96 h-96 bg-gradient-to-r from-yellow-400/5 to-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Enhanced Header */}
      <header className="backdrop-blur-xl bg-white/90 border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-5">
          <div className="flex justify-between items-center">
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative">
                <div className="w-12 h-12 gradient-ecuador rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">R</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gradient-ecuador">RemesaPay</h1>
                <p className="text-sm text-gray-600 font-medium">Para Ecuador 🇪🇨</p>
              </div>
            </motion.div>
            
            <div className="flex items-center space-x-6">
              <motion.button 
                onClick={() => setIsSpanish(!isSpanish)}
                className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-sm font-medium">{isSpanish ? '🇪🇸 ES' : '🇺🇸 EN'}</span>
              </motion.button>
              
              <WalletConnect 
                onConnect={handleWalletConnect}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Hero Section */}
      <section className="relative container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-6 gradient-ecuador rounded-sm shadow-sm"></div>
              <span className="text-lg font-semibold text-gray-700">Para mi familia en Ecuador</span>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-6xl md:text-7xl font-bold text-gray-900 leading-tight">
                <span className="text-gradient-ecuador">{t.hero.title}</span>
              </h1>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-700">
                {t.hero.subtitle}
              </h2>
            </div>
            
            <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
              {t.hero.description}
            </p>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 my-8">
              <motion.div 
                className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-3xl font-bold text-green-600 mb-2">{t.stats.fee}</div>
                <div className="text-sm text-gray-600 font-medium">{t.stats.feeLabel}</div>
              </motion.div>
              
              <motion.div 
                className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-3xl font-bold text-blue-600 mb-2">{t.stats.time}</div>
                <div className="text-sm text-gray-600 font-medium">{t.stats.timeLabel}</div>
              </motion.div>
              
              <motion.div 
                className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-3xl font-bold text-purple-600 mb-2">{t.stats.saved}</div>
                <div className="text-sm text-gray-600 font-medium">{t.stats.savedLabel}</div>
              </motion.div>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ShieldCheckIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-green-800">{t.hero.secured}</p>
                  <p className="text-sm text-green-600">Base Network</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ClockIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-blue-800">{t.hero.instant}</p>
                  <p className="text-sm text-blue-600">24/7 disponible</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1"
              >
                <Button size="lg" className="w-full btn-ecuador text-lg px-8 py-6 shadow-xl">
                  {t.hero.cta}
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
              
              {connectedWallet && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-2 px-4 py-4 bg-green-50 rounded-xl border border-green-200"
                >
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    Conectado: {connectedWallet.substring(0, 6)}...{connectedWallet.substring(-4)}
                  </span>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Enhanced Calculator */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="card-ecuador max-w-lg mx-auto">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-3">Calculadora de Envío</h3>
                <p className="text-gray-600">Descubre cuánto ahorras con RemesaPay</p>
              </div>

              <div className="mb-8">
                <label className="block text-lg font-semibold text-gray-700 mb-4">
                  Monto a enviar (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-3xl font-bold">$</span>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="input-ecuador pl-14 text-4xl h-20 text-center font-bold text-gray-900 border-2 border-gray-200 focus:border-blue-500"
                    placeholder="100"
                    min="10"
                    max="10000"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-3 text-center">Límites: $10 - $10,000 USD</p>
              </div>

              {/* Enhanced Cost Breakdown */}
              <div className="space-y-6 mb-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                <h4 className="font-bold text-gray-800 text-xl mb-6 text-center">Desglose de costos</h4>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-blue-200">
                    <span className="text-gray-700 font-medium">Monto a enviar</span>
                    <span className="font-bold text-2xl text-gray-900">${amount}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b border-blue-200">
                    <span className="text-gray-700 font-medium">Comisión RemesaPay (0.5%)</span>
                    <span className="font-bold text-xl text-green-600">${(parseFloat(amount) * 0.005).toFixed(2)}</span>
                  </div>
                  
                  <div className="bg-white p-4 rounded-xl border-2 border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-bold text-lg">Total a pagar</span>
                      <span className="font-bold text-3xl text-gray-900">${(parseFloat(amount) * 1.005).toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 rounded-xl text-white shadow-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">Tu familia recibe</span>
                      <span className="font-bold text-3xl">${amount}</span>
                    </div>
                    <p className="text-green-100 mt-2 flex items-center">
                      <CheckCircleIcon className="w-4 h-4 mr-2" />
                      Llegada: Instantánea (menos de 1 minuto)
                    </p>
                  </div>
                </div>
              </div>

              {/* Enhanced Comparison */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-6 mb-8">
                <h4 className="font-bold text-red-800 mb-6 text-xl text-center">💰 vs Western Union</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                    <p className="text-3xl font-bold text-green-600 mb-2">-${((parseFloat(amount) * 0.15) - (parseFloat(amount) * 0.005)).toFixed(2)}</p>
                    <p className="text-sm text-gray-600 font-medium">Ahorras en comisiones</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                    <p className="text-3xl font-bold text-blue-600 mb-2">-3 días</p>
                    <p className="text-sm text-gray-600 font-medium">Más rápido</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-4 text-center font-medium">
                  *Western Union cobra ~15% en comisiones + 3-5 días de espera
                </p>
              </div>

              {/* Action Section */}
              <div className="space-y-4">
                {!connectedWallet ? (
                  <div className="text-center p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl">
                    <p className="text-yellow-800 mb-4 font-semibold">Conecta tu billetera para continuar</p>
                    <WalletConnect 
                      onConnect={handleWalletConnect}
                    />
                  </div>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button className="w-full btn-ecuador h-16 text-xl font-bold shadow-xl">
                      🚀 Enviar ${amount} ahora
                      <ArrowRightIcon className="w-6 h-6 ml-2" />
                    </Button>
                  </motion.div>
                )}
                
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 flex items-center justify-center">
                    <ShieldCheckIcon className="w-4 h-4 mr-2" />
                    Transacción segura en blockchain Base Network
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">¿Por qué elegir RemesaPay?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              La plataforma más avanzada para envíos de dinero a Ecuador
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: <CurrencyDollarIcon className="w-8 h-8" />,
                title: "Comisiones Ultra Bajas",
                description: "Solo 0.5% vs 10-15% de servicios tradicionales",
                color: "green"
              },
              {
                icon: <ClockIcon className="w-8 h-8" />,
                title: "Transferencias Instantáneas", 
                description: "Tu familia recibe el dinero en menos de 60 segundos",
                color: "blue"
              },
              {
                icon: <ShieldCheckIcon className="w-8 h-8" />,
                title: "Máxima Seguridad",
                description: "Protegido por blockchain y smart contracts auditados",
                color: "purple"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className={`p-8 rounded-2xl bg-gradient-to-br from-${feature.color}-50 to-${feature.color}-100 border border-${feature.color}-200 shadow-lg hover:shadow-xl transition-all duration-300`}
              >
                <div className={`w-16 h-16 bg-${feature.color}-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Testimonial */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 py-20 text-white">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex justify-center mb-6">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className="w-8 h-8 text-yellow-400 fill-current" />
              ))}
            </div>
            <blockquote className="text-3xl md:text-4xl font-bold mb-8 leading-relaxed">
              "Envié $200 a mi mamá en Quito y llegó en 30 segundos. ¡Increíble! Ahorré $29 en comisiones."
            </blockquote>
            <div className="flex items-center justify-center space-x-4">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">M</span>
              </div>
              <div className="text-left">
                <p className="font-semibold text-xl">María González</p>
                <p className="text-blue-200">Nueva York → Quito</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-16">
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
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-lg">Producto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Cómo funciona</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tarifas</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Seguridad</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-lg">Soporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Email: soporte@remesapay.com</li>
                <li>WhatsApp: +593 99 999 9999</li>
                <li>Horario: 24/7</li>
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
