'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingBagIcon,
  CreditCardIcon,
  BanknotesIcon,
  ChartBarIcon,
  UsersIcon,
  Cog6ToothIcon,
  QrCodeIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MerchantTransaction {
  id: string;
  amount: number;
  customer: string;
  date: Date;
  status: 'completed' | 'pending' | 'failed';
  paymentMethod: 'crypto' | 'card';
  txHash?: string;
}

interface MerchantStats {
  totalRevenue: number;
  todayRevenue: number;
  totalTransactions: number;
  avgTransactionValue: number;
  monthlyGrowth: number;
}

export default function MerchantDashboard() {
  const [isSpanish, setIsSpanish] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'year'>('week');
  const [qrCodeVisible, setQrCodeVisible] = useState(false);

  // Mock data
  const [stats] = useState<MerchantStats>({
    totalRevenue: 15420.50,
    todayRevenue: 324.75,
    totalTransactions: 847,
    avgTransactionValue: 18.20,
    monthlyGrowth: 12.5
  });

  const [transactions] = useState<MerchantTransaction[]>([
    {
      id: '1',
      amount: 45.20,
      customer: 'Cliente #2401',
      date: new Date(),
      status: 'completed',
      paymentMethod: 'crypto',
      txHash: '0x123...abc'
    },
    {
      id: '2',
      amount: 128.75,
      customer: 'Cliente #2402',
      date: new Date(Date.now() - 3600000),
      status: 'completed',
      paymentMethod: 'crypto',
      txHash: '0x456...def'
    },
    {
      id: '3',
      amount: 67.30,
      customer: 'Cliente #2403',
      date: new Date(Date.now() - 7200000),
      status: 'pending',
      paymentMethod: 'crypto'
    },
    {
      id: '4',
      amount: 89.90,
      customer: 'Cliente #2404',
      date: new Date(Date.now() - 86400000),
      status: 'failed',
      paymentMethod: 'crypto'
    }
  ]);

  const text = {
    es: {
      title: "Panel Comerciante",
      welcome: "¡Bienvenido de nuevo!",
      businessName: "Mi Negocio Ecuador",
      overview: "Resumen General",
      totalRevenue: "Ingresos Totales",
      todayRevenue: "Ingresos Hoy",
      totalTransactions: "Transacciones",
      avgTransaction: "Valor Promedio",
      monthlyGrowth: "Crecimiento Mensual",
      recentTransactions: "Transacciones Recientes",
      amount: "Monto",
      customer: "Cliente",
      date: "Fecha",
      status: "Estado",
      paymentMethod: "Método",
      viewAll: "Ver Todas",
      generateQR: "Generar QR",
      settings: "Configuración",
      downloadReport: "Descargar Reporte",
      quickActions: "Acciones Rápidas",
      newPayment: "Nuevo Pago",
      refund: "Reembolso",
      completed: "Completado",
      pending: "Pendiente",
      failed: "Fallido",
      crypto: "Cripto",
      card: "Tarjeta",
      today: "Hoy",
      week: "Semana",
      month: "Mes",
      year: "Año"
    },
    en: {
      title: "Merchant Dashboard",
      welcome: "Welcome back!",
      businessName: "My Business Ecuador",
      overview: "Overview",
      totalRevenue: "Total Revenue",
      todayRevenue: "Today's Revenue",
      totalTransactions: "Transactions",
      avgTransaction: "Avg. Value",
      monthlyGrowth: "Monthly Growth",
      recentTransactions: "Recent Transactions",
      amount: "Amount",
      customer: "Customer",
      date: "Date",
      status: "Status",
      paymentMethod: "Method",
      viewAll: "View All",
      generateQR: "Generate QR",
      settings: "Settings",
      downloadReport: "Download Report",
      quickActions: "Quick Actions",
      newPayment: "New Payment",
      refund: "Refund",
      completed: "Completed",
      pending: "Pending",
      failed: "Failed",
      crypto: "Crypto",
      card: "Card",
      today: "Today",
      week: "Week",
      month: "Month",
      year: "Year"
    }
  };

  const t = text[isSpanish ? 'es' : 'en'];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-ecuador rounded-full flex items-center justify-center">
                <ShoppingBagIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">RemesaPay Business</h1>
                <p className="text-sm text-gray-500">{t.businessName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select 
                value={selectedPeriod} 
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="today">{t.today}</option>
                <option value="week">{t.week}</option>
                <option value="month">{t.month}</option>
                <option value="year">{t.year}</option>
              </select>
              <button 
                onClick={() => setIsSpanish(!isSpanish)}
                className="px-3 py-1 border rounded-md text-sm hover:bg-gray-50"
              >
                {isSpanish ? 'EN' : 'ES'}
              </button>
              <Button variant="outline" size="sm">
                <Cog6ToothIcon className="w-4 h-4 mr-2" />
                {t.settings}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-ecuador text-white p-6 rounded-lg"
          >
            <h2 className="text-2xl font-bold mb-2">{t.welcome}</h2>
            <p className="text-blue-100">
              Has recibido {formatCurrency(stats.todayRevenue)} hoy con {stats.totalTransactions} transacciones
            </p>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t.totalRevenue}</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(stats.totalRevenue)}
                  </p>
                </div>
                <BanknotesIcon className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t.todayRevenue}</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(stats.todayRevenue)}
                  </p>
                </div>
                <CalendarDaysIcon className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t.totalTransactions}</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.totalTransactions}
                  </p>
                </div>
                <ChartBarIcon className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t.avgTransaction}</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatCurrency(stats.avgTransactionValue)}
                  </p>
                </div>
                <CreditCardIcon className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t.monthlyGrowth}</p>
                  <div className="flex items-center space-x-1">
                    <p className="text-2xl font-bold text-green-600">
                      +{stats.monthlyGrowth}%
                    </p>
                    <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />
                  </div>
                </div>
                <UsersIcon className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Transactions */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center space-x-2">
                    <DocumentTextIcon className="w-5 h-5 text-gray-600" />
                    <span>{t.recentTransactions}</span>
                  </CardTitle>
                  <Button variant="outline" size="sm">
                    <EyeIcon className="w-4 h-4 mr-2" />
                    {t.viewAll}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <CreditCardIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.customer}</p>
                          <p className="text-sm text-gray-500">
                            {transaction.date.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          {formatCurrency(transaction.amount)}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(transaction.status)}`}>
                            {t[transaction.status as keyof typeof t]}
                          </span>
                          <span className="text-xs text-gray-500">
                            {t[transaction.paymentMethod as keyof typeof t]}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>{t.quickActions}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => setQrCodeVisible(true)}
                >
                  <QrCodeIcon className="w-4 h-4 mr-2" />
                  {t.generateQR}
                </Button>
                
                <Button variant="outline" className="w-full">
                  <BanknotesIcon className="w-4 h-4 mr-2" />
                  {t.newPayment}
                </Button>
                
                <Button variant="outline" className="w-full">
                  <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                  {t.downloadReport}
                </Button>
              </CardContent>
            </Card>

            {/* Payment QR Code */}
            <Card>
              <CardHeader>
                <CardTitle>Código QR de Pago</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="w-32 h-32 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <QrCodeIcon className="w-16 h-16 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Los clientes pueden escanear este código para pagar
                </p>
                <Button size="sm" variant="outline" className="w-full">
                  Descargar QR
                </Button>
              </CardContent>
            </Card>

            {/* Revenue Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Ingresos del Mes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-gradient-to-r from-blue-100 to-green-100 rounded-lg flex items-center justify-center">
                  <ChartBarIcon className="w-8 h-8 text-gray-500" />
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Este mes:</span>
                    <span className="font-semibold">{formatCurrency(stats.totalRevenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mes anterior:</span>
                    <span className="font-semibold">{formatCurrency(stats.totalRevenue * 0.89)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Crecimiento:</span>
                    <span className="font-semibold">+{stats.monthlyGrowth}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {qrCodeVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setQrCodeVisible(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Código QR de Pago</h3>
              <button onClick={() => setQrCodeVisible(false)}>
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="text-center">
              <div className="w-48 h-48 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <QrCodeIcon className="w-24 h-24 text-gray-400" />
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Dirección de pago: <br />
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                  0x742d35Cc6634C0532925a3b8D1a2...
                </code>
              </p>
              
              <div className="flex space-x-3">
                <Button variant="outline" className="flex-1" size="sm">
                  Descargar
                </Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" size="sm">
                  Compartir
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
