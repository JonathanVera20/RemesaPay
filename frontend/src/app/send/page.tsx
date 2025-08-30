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
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

export default function SenderDashboard() {
  const [amount, setAmount] = useState('');
  const [selectedReceiver, setSelectedReceiver] = useState<Receiver | null>(null);
  const [currency, setCurrency] = useState<'USD' | 'EUR'>('USD');
  const [isSpanish, setIsSpanish] = useState(true);
  const [newReceiverPhone, setNewReceiverPhone] = useState('');
  const [isAddingReceiver, setIsAddingReceiver] = useState(false);

  // Mock data
  const [receivers] = useState<Receiver[]>([
    { 
      id: '1', 
      name: 'Abuela María', 
      phone: '+593987654321',
      avatar: '👵',
      lastSent: new Date('2024-01-15')
    },
    { 
      id: '2', 
      name: 'Primo Juan', 
      phone: '+593123456789',
      avatar: '👨',
      lastSent: new Date('2024-01-10')
    },
    { 
      id: '3', 
      name: 'Hermana Ana', 
      phone: '+593456789123',
      avatar: '👩',
      lastSent: new Date('2024-01-05')
    }
  ]);

  const [transactions] = useState<Transaction[]>([
    {
      id: '1',
      amount: 150,
      fee: 0.75,
      recipient: 'Abuela María',
      status: 'claimed',
      date: new Date('2024-01-15'),
      txHash: '0x123...abc'
    },
    {
      id: '2',
      amount: 200,
      fee: 1.00,
      recipient: 'Primo Juan',
      status: 'completed',
      date: new Date('2024-01-10'),
      txHash: '0x456...def'
    }
  ]);

  const text = {
    es: {
      title: "Enviar Dinero",
      amount: "Monto a enviar",
      receiver: "Destinatario",
      searchReceiver: "Buscar por número o nombre",
      frequentReceivers: "Destinatarios frecuentes",
      addReceiver: "Agregar nuevo destinatario",
      fee: "Comisión RemesaPay (0.5%)",
      total: "Total a pagar",
      receiverGets: "El destinatario recibe",
      arrival: "Llegada: Instantánea ⚡",
      sendMoney: "Enviar Dinero",
      comparison: "Ahorras $29.50 vs Western Union",
      timeComparison: "5 días → Ahora",
      transactionHistory: "Historial de Transacciones",
      status: {
        pending: "Pendiente",
        completed: "Completado",
        claimed: "Reclamado"
      }
    },
    en: {
      title: "Send Money",
      amount: "Amount to send",
      receiver: "Recipient",
      searchReceiver: "Search by number or name",
      frequentReceivers: "Frequent recipients",
      addReceiver: "Add new recipient",
      fee: "RemesaPay fee (0.5%)",
      total: "Total to pay",
      receiverGets: "Recipient receives",
      arrival: "Arrival: Instant ⚡",
      sendMoney: "Send Money",
      comparison: "You save $29.50 vs Western Union",
      timeComparison: "5 days → Now",
      transactionHistory: "Transaction History",
      status: {
        pending: "Pending",
        completed: "Completed",
        claimed: "Claimed"
      }
    }
  };

  const t = text[isSpanish ? 'es' : 'en'];

  const calculateFee = (amount: number) => amount * 0.005;
  const calculateTotal = (amount: number) => amount * 1.005;
  const westernUnionFee = (amount: number) => Math.max(amount * 0.15, 30);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-ecuador rounded-full flex items-center justify-center">
                <span className="text-white font-bold">R</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">RemesaPay</h1>
                <p className="text-sm text-gray-500">España → Ecuador</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select 
                value={currency} 
                onChange={(e) => setCurrency(e.target.value as 'USD' | 'EUR')}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
              <button 
                onClick={() => setIsSpanish(!isSpanish)}
                className="flex items-center space-x-1 px-3 py-1 border rounded-md text-sm hover:bg-gray-50"
              >
                <GlobeAltIcon className="w-4 h-4" />
                <span>{isSpanish ? 'EN' : 'ES'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Send Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PaperAirplaneIcon className="w-6 h-6 text-blue-600" />
                  <span>{t.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.amount}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">
                      {currency === 'USD' ? '$' : '€'}
                    </span>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-8 text-xl h-12 font-semibold"
                      placeholder="100"
                    />
                  </div>
                </div>

                {/* Receiver Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.receiver}
                  </label>
                  
                  {!selectedReceiver ? (
                    <div className="space-y-4">
                      <Input
                        placeholder={t.searchReceiver}
                        className="h-12"
                      />
                      
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-sm font-medium text-gray-700">{t.frequentReceivers}</h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsAddingReceiver(true)}
                            className="text-xs"
                          >
                            <PlusIcon className="w-4 h-4 mr-1" />
                            {t.addReceiver}
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {receivers.map((receiver) => (
                            <motion.button
                              key={receiver.id}
                              onClick={() => setSelectedReceiver(receiver)}
                              className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors text-left"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg">
                                {receiver.avatar}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{receiver.name}</p>
                                <p className="text-sm text-gray-500">{receiver.phone}</p>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-xl">
                          {selectedReceiver.avatar}
                        </div>
                        <div>
                          <p className="font-semibold text-blue-900">{selectedReceiver.name}</p>
                          <p className="text-sm text-blue-700">{selectedReceiver.phone}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedReceiver(null)}
                        className="text-blue-600"
                      >
                        Cambiar
                      </Button>
                    </div>
                  )}
                </div>

                {/* Fee Calculation */}
                {amount && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{t.fee}</span>
                      <span className="font-medium">
                        {currency === 'USD' ? '$' : '€'}{calculateFee(parseFloat(amount)).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{t.total}</span>
                      <span className="font-bold text-lg">
                        {currency === 'USD' ? '$' : '€'}{calculateTotal(parseFloat(amount)).toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t.receiverGets}</span>
                        <span className="font-bold text-xl text-green-600">
                          ${parseFloat(amount).toFixed(2)} USD
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 flex items-center">
                        <ClockIcon className="w-3 h-3 mr-1" />
                        {t.arrival}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Send Button */}
                <Button 
                  className="w-full h-12 bg-gradient-ecuador text-white text-lg font-semibold"
                  disabled={!amount || !selectedReceiver}
                >
                  <PaperAirplaneIcon className="w-5 h-5 mr-2" />
                  {t.sendMoney} {amount && `${currency === 'USD' ? '$' : '€'}${amount}`}
                </Button>
              </CardContent>
            </Card>

            {/* Comparison Widget */}
            {amount && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-green-800 mb-4">
                        💰 {t.comparison.replace('$29.50', `${currency === 'USD' ? '$' : '€'}${(westernUnionFee(parseFloat(amount)) - calculateFee(parseFloat(amount))).toFixed(2)}`)}
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-bold text-2xl text-green-600">
                            -{currency === 'USD' ? '$' : '€'}{(westernUnionFee(parseFloat(amount)) - calculateFee(parseFloat(amount))).toFixed(2)}
                          </div>
                          <div className="text-green-700">Ahorras en comisiones</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-2xl text-blue-600">-5 días</div>
                          <div className="text-blue-700">{t.timeComparison}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Transaction History Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DocumentTextIcon className="w-5 h-5 text-gray-600" />
                  <span>{t.transactionHistory}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {transactions.map((tx) => (
                  <div key={tx.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-900">{tx.recipient}</p>
                        <p className="text-sm text-gray-500">
                          {tx.date.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">${tx.amount}</p>
                        <p className="text-xs text-gray-500">Fee: ${tx.fee}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        tx.status === 'claimed' ? 'bg-green-100 text-green-700' :
                        tx.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {t.status[tx.status]}
                      </span>
                      
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" className="text-xs">
                          <ArrowPathIcon className="w-3 h-3 mr-1" />
                          Reenviar
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs">
                          <DocumentTextIcon className="w-3 h-3 mr-1" />
                          Recibo
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">$2,450</div>
                    <div className="text-sm text-gray-600">Total enviado este mes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">$147</div>
                    <div className="text-sm text-gray-600">Ahorrado vs Western Union</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">23</div>
                    <div className="text-sm text-gray-600">Transferencias completadas</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Receiver Modal */}
      <AnimatePresence>
        {isAddingReceiver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsAddingReceiver(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">{t.addReceiver}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <Input placeholder="Ej: Abuela María" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono Ecuador
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      +593
                    </span>
                    <Input 
                      placeholder="987654321"
                      className="rounded-l-none"
                      value={newReceiverPhone}
                      onChange={(e) => setNewReceiverPhone(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setIsAddingReceiver(false)}
                  >
                    Cancelar
                  </Button>
                  <Button className="flex-1 bg-gradient-ecuador text-white">
                    Agregar
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
