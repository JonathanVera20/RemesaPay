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
  CheckCircleIcon
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
        title: "Envía dinero a Ecuador en segundos, no días",
        subtitle: "0.5% de comisión vs 15% de Western Union",
        cta: "Enviar Dinero Ahora",
        secured: "Asegurado por Ethereum",
        instant: "Liquidación Instantánea"
      },
      howItWorks: {
        title: "Cómo Funciona",
        step1: "Conecta tu billetera",
        step2: "Ingresa el monto",
        step3: "El receptor recibe al instante"
      },
      comparison: {
        title: "RemesaPay vs Western Union",
        time: "5 días → Instantáneo",
        fee: "$30 comisión → $0.50 comisión"
      },
      testimonial: "Mi abuela recibió el dinero en 30 segundos",
      stats: {
        saved: "Dinero Ahorrado",
        transfers: "Transferencias Completadas", 
        families: "Familias Felices"
      }
    },
    en: {
      hero: {
        title: "Send money to Ecuador in seconds, not days",
        subtitle: "0.5% fee vs 15% Western Union",
        cta: "Send Money Now",
        secured: "Secured by Ethereum",
        instant: "Instant Settlement"
      },
      howItWorks: {
        title: "How It Works",
        step1: "Connect your wallet",
        step2: "Enter amount",
        step3: "Receiver gets instantly"
      },
      comparison: {
        title: "RemesaPay vs Western Union",
        time: "5 days → Instant",
        fee: "$30 fee → $0.50 fee"
      },
      testimonial: "My grandmother received the money in 30 seconds",
      stats: {
        saved: "Money Saved",
        transfers: "Transfers Completed",
        families: "Happy Families"
      }
    }
  };

  const t = text[isSpanish ? 'es' : 'en'];

  return (
    <div className="min-h-screen hero-section">
      {/* Header */}
      <header className="backdrop-blur-sm bg-white/80 border-b border-white/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 gradient-ecuador rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient-ecuador">RemesaPay</h1>
              <p className="text-xs text-gray-600">Para Ecuador 🇪🇨</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsSpanish(!isSpanish)}
              className="text-sm px-4 py-2 rounded-full bg-white/70 backdrop-blur-sm border border-gray-200 hover:bg-white transition-all duration-300"
            >
              {isSpanish ? '🇺🇸 EN' : '🇪🇨 ES'}
            </button>
            <WalletConnect 
              onConnect={handleWalletConnect}
              variant="outline"
            />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-6 gradient-ecuador rounded-sm"></div>
              <span className="text-lg font-semibold text-gray-700">Para mi familia en Ecuador</span>
            </div>
            
            <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
              <span className="text-gradient-ecuador">{t.hero.title}</span>
            </h1>
            
            <p className="text-2xl text-gray-600 mb-8 leading-relaxed">
              {t.hero.subtitle}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ShieldCheckIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-green-800">{t.hero.secured}</p>
                  <p className="text-sm text-green-600">Blockchain seguro</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ClockIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-blue-800">{t.hero.instant}</p>
                  <p className="text-sm text-blue-600">En segundos</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="btn-ecuador text-lg px-8 py-4 flex-1">
                {t.hero.cta}
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Button>
              
              {connectedWallet && (
                <div className="flex items-center space-x-2 px-4 py-4 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-700">Billetera conectada</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Enhanced Remittance Calculator */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="card-ecuador">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Calculadora de Envío</h3>
                <p className="text-gray-600">Calcula cuánto ahorra tu familia</p>
              </div>

              <div className="mb-8">
                <label className="block text-lg font-semibold text-gray-700 mb-3">
                  Monto a enviar (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-2xl font-bold">$</span>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="input-ecuador pl-12 text-3xl h-16 text-center font-bold text-gray-900"
                    placeholder="100"
                    min="10"
                    max="10000"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">Límites: $10 - $10,000 USD</p>
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-4 mb-8 p-6 bg-gradient-ecuador-subtle rounded-xl">
                <h4 className="font-semibold text-gray-800 text-lg mb-4">Desglose de costos</h4>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Monto a enviar</span>
                  <span className="font-semibold text-xl">${amount}</span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Comisión RemesaPay (0.5%)</span>
                  <span className="font-semibold text-green-600">${(parseFloat(amount) * 0.005).toFixed(2)}</span>
                </div>
                
                <div className="border-t border-gray-300 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-semibold">Total a pagar</span>
                    <span className="font-bold text-2xl text-gray-900">${(parseFloat(amount) * 1.005).toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <div className="flex justify-between items-center">
                    <span className="text-green-800 font-semibold">Tu familia recibe</span>
                    <span className="font-bold text-2xl text-green-600">${amount}</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">✅ Llegada: Instantánea (menos de 1 minuto)</p>
                </div>
              </div>

              {/* Comparison with competitors */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
                <h4 className="font-semibold text-red-800 mb-4">💰 Comparación con Western Union</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">-${((parseFloat(amount) * 0.15) - (parseFloat(amount) * 0.005)).toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Ahorras en comisiones</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">-3 días</p>
                    <p className="text-sm text-gray-600">Más rápido</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-3 text-center">
                  *Western Union cobra ~15% en comisiones + tiempo de espera
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                {!connectedWallet ? (
                  <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 mb-3">Conecta tu billetera para continuar</p>
                    <WalletConnect 
                      onConnect={handleWalletConnect}
                      variant="default"
                      size="lg"
                    />
                  </div>
                ) : (
                  <Button className="w-full btn-ecuador h-14 text-xl font-bold">
                    🚀 Enviar ${amount} ahora
                    <ArrowRightIcon className="w-6 h-6 ml-2" />
                  </Button>
                )}
                
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    🔒 Transacción segura en blockchain Base
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Recipient Information Section */}
      <section className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="card-ecuador max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Información del Receptor</h3>
              <p className="text-gray-600">Datos de quien recibirá el dinero en Ecuador</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recipient Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre completo del receptor
                </label>
                <Input
                  type="text"
                  placeholder="María González López"
                  className="input-ecuador"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Teléfono (Ecuador)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">+593</span>
                  <Input
                    type="tel"
                    placeholder="999-123-456"
                    className="input-ecuador pl-16"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Formato: 9-99-123-456 (celular)</p>
              </div>

              {/* Wallet Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dirección de billetera (Base Network)
                </label>
                <Input
                  type="text"
                  placeholder="0x742d35Cc6635C0532925a3b8D2b78b1E3f3bae50"
                  className="input-ecuador font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  🔗 La billetera debe estar configurada en Base Network
                </p>
              </div>

              {/* Relationship */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Parentesco
                </label>
                <select className="input-ecuador">
                  <option value="">Seleccionar...</option>
                  <option value="madre">Madre</option>
                  <option value="padre">Padre</option>
                  <option value="hermano">Hermano/a</option>
                  <option value="hijo">Hijo/a</option>
                  <option value="esposo">Esposo/a</option>
                  <option value="primo">Primo/a</option>
                  <option value="amigo">Amigo/a</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Propósito del envío
                </label>
                <select className="input-ecuador">
                  <option value="">Seleccionar...</option>
                  <option value="family_support">Apoyo familiar</option>
                  <option value="education">Educación</option>
                  <option value="healthcare">Salud/Medicina</option>
                  <option value="business">Negocio</option>
                  <option value="emergency">Emergencia</option>
                  <option value="other">Otro</option>
                </select>
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <ShieldCheckIcon className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">Seguridad y Privacidad</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Toda la información está encriptada y protegida</li>
                    <li>• Los datos se almacenan de forma descentralizada en blockchain</li>
                    <li>• Solo tú y el receptor pueden ver los detalles de la transacción</li>
                    <li>• Cumplimos con regulaciones financieras de Ecuador y USA</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Animated Transfer Visualization */}
      <section className="container mx-auto px-4 py-16">
        <div className="relative">
          <div className="flex justify-between items-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-white font-bold">USA</span>
              </div>
              <p className="text-sm text-gray-600">Envío desde</p>
            </div>
            
            <div className="flex-1 relative mx-8">
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-ecuador"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <motion.div
                className="absolute top-1/2 transform -translate-y-1/2"
                animate={{ x: [0, 200, 400] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <BanknotesIcon className="w-8 h-8 text-green-600" />
              </motion.div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                <img src="/flag-ecuador.svg" alt="Ecuador" className="w-8 h-6" />
              </div>
              <p className="text-sm text-gray-600">Recepción en Ecuador</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Ecuador Optimized */}
      <section className="container mx-auto px-4 py-20 bg-gradient-ecuador-subtle">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">¿Cómo funciona RemesaPay?</h2>
          <p className="text-xl text-gray-600">3 pasos simples para enviar dinero a Ecuador</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {[
            { 
              step: 1, 
              title: "Conecta tu billetera", 
              description: "Usa MetaMask o cualquier billetera compatible con Base Network",
              icon: '🔗',
              detail: "Configuración automática en Base Network para menores costos"
            },
            { 
              step: 2, 
              title: "Completa la información", 
              description: "Ingresa datos del receptor en Ecuador y confirma el monto",
              icon: '�',
              detail: "Validación automática de números ecuatorianos (+593)"
            },
            { 
              step: 3, 
              title: "Envío instantáneo", 
              description: "Tu familia recibe el dinero en menos de 1 minuto",
              icon: '⚡',
              detail: "Transacción verificada en blockchain, sin intermediarios"
            }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="text-center"
            >
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-ecuador rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg">
                  {item.icon}
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {item.step}
                </div>
              </div>
              
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">{item.title}</h3>
              <p className="text-lg text-gray-600 mb-4">{item.description}</p>
              <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-400">
                <p className="text-sm text-gray-700 font-medium">{item.detail}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Ecuador-specific benefits */}
        <div className="mt-20 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center p-6 bg-white rounded-xl shadow-md">
            <div className="text-3xl mb-3">🇪🇨</div>
            <h4 className="font-semibold text-gray-900 mb-2">Para Ecuador</h4>
            <p className="text-sm text-gray-600">Optimizado para familias ecuatorianas</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-xl shadow-md">
            <div className="text-3xl mb-3">💵</div>
            <h4 className="font-semibold text-gray-900 mb-2">USD Directo</h4>
            <p className="text-sm text-gray-600">Sin conversión, Ecuador usa dólares</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-xl shadow-md">
            <div className="text-3xl mb-3">📞</div>
            <h4 className="font-semibold text-gray-900 mb-2">Soporte 24/7</h4>
            <p className="text-sm text-gray-600">En español, horario Ecuador</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-xl shadow-md">
            <div className="text-3xl mb-3">🏦</div>
            <h4 className="font-semibold text-gray-900 mb-2">Sin bancos</h4>
            <p className="text-sm text-gray-600">Directo a billetera digital</p>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-16">{t.comparison.title}</h2>
        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden">
            <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
              <div className="p-8 text-center">
                <h3 className="text-lg font-semibold mb-4">Característica</h3>
                <div className="space-y-4 text-left">
                  <p>Tiempo de envío</p>
                  <p>Comisión por $100</p>
                  <p>Horario de servicio</p>
                  <p>Tecnología</p>
                </div>
              </div>
              <div className="p-8 text-center bg-red-50">
                <h3 className="text-lg font-semibold mb-4 text-red-700">Western Union</h3>
                <div className="space-y-4 text-left">
                  <p className="text-red-600">3-5 días laborales</p>
                  <p className="text-red-600">$15.00</p>
                  <p className="text-red-600">9AM - 6PM</p>
                  <p className="text-red-600">Sistema bancario tradicional</p>
                </div>
              </div>
              <div className="p-8 text-center bg-green-50">
                <h3 className="text-lg font-semibold mb-4 text-green-700">RemesaPay</h3>
                <div className="space-y-4 text-left">
                  <p className="text-green-600 font-semibold">Instantáneo ⚡</p>
                  <p className="text-green-600 font-semibold">$0.50</p>
                  <p className="text-green-600 font-semibold">24/7</p>
                  <p className="text-green-600 font-semibold">Blockchain</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Social Proof */}
      <section className="container mx-auto px-4 py-20 bg-gray-50">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-8">Lo que dicen nuestros usuarios</h2>
          <Card className="max-w-2xl mx-auto p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="flex text-yellow-400">
                {'⭐'.repeat(5)}
              </div>
            </div>
            <blockquote className="text-xl italic text-gray-700 mb-6">
              "{t.testimonial}"
            </blockquote>
            <cite className="text-gray-600">- María González, Quito</cite>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-8 text-center">
          {[
            { value: '$2.3M', label: t.stats.saved },
            { value: '15,234', label: t.stats.transfers },
            { value: '8,456', label: t.stats.families }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="text-4xl font-bold text-gradient mb-2">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Map Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-16">Disponible en toda Ecuador</h2>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="bg-gradient-to-br from-blue-100 to-yellow-100 rounded-2xl p-8 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xl font-semibold mb-4">Red de farmacias asociadas</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <MapPinIcon className="w-5 h-5 text-blue-600" />
                    <span>Fybeca - 200+ ubicaciones</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPinIcon className="w-5 h-5 text-blue-600" />
                    <span>Cruz Azul - 150+ ubicaciones</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPinIcon className="w-5 h-5 text-blue-600" />
                    <span>Medicity - 100+ ubicaciones</span>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-200 rounded-full opacity-50"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-200 rounded-full opacity-50"></div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <CheckCircleIcon className="w-6 h-6 text-green-600 mt-1" />
              <div>
                <h4 className="font-semibold">Retiro inmediato</h4>
                <p className="text-gray-600">Presenta tu código QR y recibe tu dinero al instante</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <PhoneIcon className="w-6 h-6 text-green-600 mt-1" />
              <div>
                <h4 className="font-semibold">Sin necesidad de cuenta bancaria</h4>
                <p className="text-gray-600">Solo necesitas un número de teléfono ecuatoriano</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <BanknotesIcon className="w-6 h-6 text-green-600 mt-1" />
              <div>
                <h4 className="font-semibold">Efectivo en dólares</h4>
                <p className="text-gray-600">Recibe exactamente lo que se envió, sin conversión</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-gradient-ecuador rounded-full"></div>
                <h3 className="text-xl font-bold">RemesaPay</h3>
              </div>
              <p className="text-gray-400">
                La forma más rápida y económica de enviar dinero a Ecuador.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Cómo funciona</li>
                <li>Precios</li>
                <li>Seguridad</li>
                <li>API</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Centro de ayuda</li>
                <li>Contacto</li>
                <li>WhatsApp: +593 99 999 9999</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Tecnología</h4>
              <div className="flex items-center space-x-2 mb-2">
                <img src="/base-logo.png" alt="Base" className="w-6 h-6" />
                <span className="text-gray-400">Powered by Base</span>
              </div>
              <div className="flex items-center space-x-2">
                <img src="/ethereum-logo.png" alt="Ethereum" className="w-6 h-6" />
                <span className="text-gray-400">Secured by Ethereum</span>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 RemesaPay. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
