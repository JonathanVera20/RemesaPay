'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CalculatorIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
  ChartBarIcon,
  ClockIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import Layout from '@/components/Layout';

export default function CalculatorPage() {
  const [amount, setAmount] = useState('100');
  const [isSpanish, setIsSpanish] = useState(true);

  const text = {
    es: {
      title: "Calculadora de Remesas",
      subtitle: "Descubre cuánto ahorras con RemesaPay",
      form: {
        amount: "Monto a enviar (USD)",
        placeholder: "Ingresa el monto"
      },
      breakdown: {
        title: "Desglose Detallado",
        sending: "Monto a enviar",
        remesaFee: "Comisión RemesaPay (0.5%)",
        westernFee: "Comisión Western Union (~15%)",
        total: "Total a pagar",
        receives: "Tu familia recibe",
        savings: "Tu ahorro total",
        timeCompare: "Tiempo de transferencia"
      },
      comparison: {
        title: "Comparación con Competidores",
        remesa: "RemesaPay",
        western: "Western Union",
        moneygram: "MoneyGram",
        ria: "Ria Money Transfer"
      },
      cta: {
        title: "¿Listo para ahorrar?",
        description: "Únete a miles de familias que ya envían dinero de manera inteligente",
        button: "Enviar Dinero Ahora"
      }
    },
    en: {
      title: "Remittance Calculator",
      subtitle: "Discover how much you save with RemesaPay",
      form: {
        amount: "Amount to send (USD)",
        placeholder: "Enter amount"
      },
      breakdown: {
        title: "Detailed Breakdown",
        sending: "Amount sending",
        remesaFee: "RemesaPay fee (0.5%)",
        westernFee: "Western Union fee (~15%)",
        total: "Total to pay",
        receives: "Your family receives",
        savings: "Your total savings",
        timeCompare: "Transfer time"
      },
      comparison: {
        title: "Comparison with Competitors",
        remesa: "RemesaPay",
        western: "Western Union",
        moneygram: "MoneyGram",
        ria: "Ria Money Transfer"
      },
      cta: {
        title: "Ready to save?",
        description: "Join thousands of families already sending money smartly",
        button: "Send Money Now"
      }
    }
  };

  const t = text[isSpanish ? 'es' : 'en'];

  const competitors = [
    {
      name: t.comparison.remesa,
      fee: 0.5,
      time: "<60s",
      color: "green",
      highlight: true
    },
    {
      name: t.comparison.western,
      fee: 15,
      time: "3-5 días",
      color: "red"
    },
    {
      name: t.comparison.moneygram,
      fee: 12,
      time: "2-4 días",
      color: "orange"
    },
    {
      name: t.comparison.ria,
      fee: 10,
      time: "1-3 días",
      color: "yellow"
    }
  ];

  const amountNum = parseFloat(amount) || 0;
  const remesaFee = amountNum * 0.005;
  const westernFee = amountNum * 0.15;
  const savings = westernFee - remesaFee;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-20">
        <div className="container mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                <CalculatorIcon className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              <span className="text-gradient-ecuador">{t.title}</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t.subtitle}</p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Calculator Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="card-ecuador sticky top-24">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <CurrencyDollarIcon className="w-7 h-7 mr-3 text-green-600" />
                  Calculator
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-lg font-semibold text-gray-700 mb-3">
                      {t.form.amount}
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-3xl font-bold">$</span>
                      <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="input-ecuador pl-14 text-4xl h-20 text-center font-bold text-gray-900 border-2 border-gray-200 focus:border-green-500"
                        placeholder="100"
                        min="10"
                        max="10000"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-3 text-center">Límites: $10 - $10,000 USD</p>
                  </div>

                  {/* Quick Amount Buttons */}
                  <div className="grid grid-cols-3 gap-3">
                    {['50', '100', '200', '500', '1000', '2000'].map((quickAmount) => (
                      <Button
                        key={quickAmount}
                        variant="outline"
                        size="sm"
                        onClick={() => setAmount(quickAmount)}
                        className={`transition-all duration-300 ${amount === quickAmount ? 'bg-green-100 border-green-500 text-green-700' : 'hover:bg-green-50'}`}
                      >
                        ${quickAmount}
                      </Button>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <Link href="/send">
                      <Button className="w-full btn-ecuador h-14 text-lg font-bold">
                        {t.cta.button}
                        <ArrowRightIcon className="w-5 h-5 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Cost Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2"
            >
              <div className="card-ecuador">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                  <ChartBarIcon className="w-7 h-7 mr-3 text-blue-600" />
                  {t.breakdown.title}
                </h2>
                
                <div className="space-y-6">
                  {/* RemesaPay Breakdown */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-green-800 mb-6 flex items-center">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-sm">R</span>
                      </div>
                      RemesaPay - La Opción Inteligente
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">{t.breakdown.sending}</span>
                          <span className="font-bold text-xl">${amountNum.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-green-700">{t.breakdown.remesaFee}</span>
                          <span className="font-bold text-lg text-green-600">${remesaFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-green-300">
                          <span className="font-bold text-green-800">Total a pagar</span>
                          <span className="font-bold text-2xl text-green-800">${(amountNum + remesaFee).toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-green-500 text-white p-4 rounded-xl">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">{t.breakdown.receives}</span>
                            <span className="font-bold text-2xl">${amountNum.toFixed(2)}</span>
                          </div>
                          <p className="text-green-100 text-sm mt-2">⚡ Llega en 30-60 segundos</p>
                        </div>
                        <div className="flex items-center space-x-3 text-green-700">
                          <ClockIcon className="w-5 h-5" />
                          <span className="font-medium">Transferencia instantánea</span>
                        </div>
                        <div className="flex items-center space-x-3 text-green-700">
                          <ShieldCheckIcon className="w-5 h-5" />
                          <span className="font-medium">Blockchain seguro</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Western Union Comparison */}
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-red-800 mb-6">
                      💸 Western Union - Método Tradicional
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">{t.breakdown.sending}</span>
                          <span className="font-bold text-xl">${amountNum.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-red-700">{t.breakdown.westernFee}</span>
                          <span className="font-bold text-lg text-red-600">${westernFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-red-300">
                          <span className="font-bold text-red-800">Total a pagar</span>
                          <span className="font-bold text-2xl text-red-800">${(amountNum + westernFee).toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-red-500 text-white p-4 rounded-xl">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">{t.breakdown.receives}</span>
                            <span className="font-bold text-2xl">${amountNum.toFixed(2)}</span>
                          </div>
                          <p className="text-red-100 text-sm mt-2">🐌 Llega en 3-5 días</p>
                        </div>
                        <div className="flex items-center space-x-3 text-red-700">
                          <ClockIcon className="w-5 h-5" />
                          <span className="font-medium">3-5 días de espera</span>
                        </div>
                        <div className="text-red-700 font-medium">
                          🏢 Filas y papeles
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Savings Highlight */}
                  <motion.div 
                    className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white p-8 rounded-2xl shadow-xl text-center"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-2xl font-bold mb-4">🎉 ¡Tu Ahorro Total!</h3>
                    <div className="text-5xl font-bold mb-2">${savings.toFixed(2)}</div>
                    <p className="text-lg opacity-90">Ahorras {((savings / (amountNum + westernFee)) * 100).toFixed(1)}% del costo total</p>
                    <p className="text-sm opacity-75 mt-2">+ 3-5 días más rápido</p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Detailed Comparison Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16"
          >
            <div className="card-ecuador">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{t.comparison.title}</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-4 px-4 font-bold text-gray-900">Servicio</th>
                      <th className="text-center py-4 px-4 font-bold text-gray-900">Comisión</th>
                      <th className="text-center py-4 px-4 font-bold text-gray-900">Costo Total</th>
                      <th className="text-center py-4 px-4 font-bold text-gray-900">Tiempo</th>
                      <th className="text-center py-4 px-4 font-bold text-gray-900">Ahorro vs WU</th>
                    </tr>
                  </thead>
                  <tbody>
                    {competitors.map((competitor, index) => {
                      const fee = amountNum * (competitor.fee / 100);
                      const total = amountNum + fee;
                      const savingsVsWU = (amountNum + westernFee) - total;
                      
                      return (
                        <motion.tr
                          key={competitor.name}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`border-b border-gray-100 ${competitor.highlight ? 'bg-green-50' : 'bg-white'} hover:bg-gray-50 transition-colors`}
                        >
                          <td className="py-6 px-4">
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 bg-${competitor.color}-500 rounded-lg flex items-center justify-center`}>
                                <span className="text-white font-bold text-sm">
                                  {competitor.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <div className="font-bold text-gray-900">{competitor.name}</div>
                                {competitor.highlight && (
                                  <div className="text-sm text-green-600 font-medium">⭐ Recomendado</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="text-center py-6 px-4">
                            <span className={`font-bold text-lg ${competitor.highlight ? 'text-green-600' : 'text-gray-900'}`}>
                              {competitor.fee}%
                            </span>
                            <div className="text-sm text-gray-500">${fee.toFixed(2)}</div>
                          </td>
                          <td className="text-center py-6 px-4">
                            <span className={`font-bold text-xl ${competitor.highlight ? 'text-green-600' : 'text-gray-900'}`}>
                              ${total.toFixed(2)}
                            </span>
                          </td>
                          <td className="text-center py-6 px-4">
                            <span className={`font-medium ${competitor.highlight ? 'text-green-600' : 'text-gray-700'}`}>
                              {competitor.time}
                            </span>
                          </td>
                          <td className="text-center py-6 px-4">
                            <span className={`font-bold text-lg ${savingsVsWU > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                              {savingsVsWU > 0 ? `+$${savingsVsWU.toFixed(2)}` : '$0.00'}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-16 text-center"
          >
            <div className="card-ecuador max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{t.cta.title}</h2>
              <p className="text-xl text-gray-600 mb-8">{t.cta.description}</p>
              <Link href="/send">
                <Button size="lg" className="btn-ecuador text-xl px-12 py-4 shadow-xl">
                  {t.cta.button}
                  <ArrowRightIcon className="w-6 h-6 ml-3" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
