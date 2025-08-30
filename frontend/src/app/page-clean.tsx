'use client';

import { motion } from 'framer-motion';
import { 
  ArrowRightIcon, 
  CurrencyDollarIcon,
  ClockIcon, 
  ShieldCheckIcon,
  CheckCircleIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import Layout from '@/components/Layout';

export default function HomePage() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-yellow-50 to-red-50 py-20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* Ecuador Flag Badge */}
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-6 bg-gradient-to-r from-yellow-400 via-blue-500 to-red-500 rounded-sm shadow-sm"></div>
                <span className="text-lg font-semibold text-gray-700">Para mi familia en Ecuador</span>
              </div>
              
              {/* Main Headline */}
              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight">
                  <span className="bg-gradient-to-r from-yellow-600 via-blue-600 to-red-600 bg-clip-text text-transparent">
                    Envía dinero a Ecuador
                  </span>
                </h1>
                <h2 className="text-3xl md:text-5xl font-bold text-gray-700">
                  en segundos, no días
                </h2>
              </div>
              
              {/* Description */}
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                La forma más rápida y económica de enviar dinero a tu familia en Ecuador. 
                Solo 0.5% de comisión vs 15% de Western Union.
              </p>

              {/* Trust Badge */}
              <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex -space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full border-2 border-white flex items-center justify-center text-white font-bold text-sm">
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="font-semibold text-green-800">Confiado por +50,000 familias</p>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                    <span className="text-sm text-green-600 ml-2">4.9/5</span>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/send" className="flex-1">
                  <button className="w-full bg-gradient-to-r from-yellow-400 via-blue-500 to-red-500 hover:from-yellow-500 hover:via-blue-600 hover:to-red-600 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-lg">
                    Enviar Dinero Ahora
                    <ArrowRightIcon className="w-5 h-5 ml-2 inline" />
                  </button>
                </Link>
                
                <Link href="/calculator" className="flex-1">
                  <button className="w-full text-lg px-8 py-4 border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 rounded-lg bg-white text-gray-700">
                    Calcular Ahorro
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
                  className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300"
                >
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Vista Previa</h3>
                    <p className="text-gray-600">Mira qué fácil es</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Tú envías</span>
                      <span className="text-2xl font-bold">$100</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-200">
                      <span className="text-green-700">Comisión RemesaPay</span>
                      <span className="text-xl font-bold text-green-600">$0.50</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <span className="text-blue-700">Familia recibe</span>
                      <span className="text-2xl font-bold text-blue-600">$100</span>
                    </div>
                    
                    <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-red-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700">⚡ Llega en 30-60 segundos</p>
                    </div>
                  </div>
                </motion.div>

                {/* Floating Ecuador Flag */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-6 -right-6 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg"
                >
                  <span className="text-2xl">🇪🇨</span>
                </motion.div>
                
                {/* Floating Check */}
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -bottom-4 -left-4 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
                >
                  <CheckCircleIcon className="w-6 h-6 text-white" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
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
              <div className="text-lg font-semibold text-gray-700">
                Comisión Ultra Baja
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
              <div className="text-lg font-semibold text-gray-700">
                Transferencia Instantánea
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
              <div className="text-lg font-semibold text-gray-700">
                Ahorrado en Comisiones
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">¿Por qué elegir RemesaPay?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              La plataforma más avanzada para envíos de dinero a Ecuador
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0 * 0.2 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="p-8 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg">
                <CurrencyDollarIcon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Comisiones Ultra Bajas</h3>
              <p className="text-gray-600 leading-relaxed">Solo 0.5% vs 10-15% de servicios tradicionales</p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 * 0.2 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg">
                <ClockIcon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Transferencias Instantáneas</h3>
              <p className="text-gray-600 leading-relaxed">Tu familia recibe el dinero en menos de 60 segundos</p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2 * 0.2 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg">
                <ShieldCheckIcon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Máxima Seguridad</h3>
              <p className="text-gray-600 leading-relaxed">Protegido por blockchain y smart contracts auditados</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
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
            <blockquote className="text-2xl md:text-4xl font-bold mb-8 leading-relaxed">
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

      {/* Final CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              ¿Listo para enviar dinero?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Únete a miles de familias que ya confían en RemesaPay
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Link href="/send" className="flex-1">
                <button className="w-full bg-gradient-to-r from-yellow-400 via-blue-500 to-red-500 hover:from-yellow-500 hover:via-blue-600 hover:to-red-600 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 shadow-lg text-lg">
                  Empezar Ahora
                  <ArrowRightIcon className="w-5 h-5 ml-2 inline" />
                </button>
              </Link>
              <Link href="/calculator" className="flex-1">
                <button className="w-full text-lg px-8 py-4 border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 rounded-lg bg-white text-gray-700">
                  Calcular Ahorro
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
