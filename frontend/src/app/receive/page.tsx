'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BanknotesIcon,
  PhoneIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  QrCodeIcon,
  ShareIcon,
  ArrowDownTrayIcon,
  CreditCardIcon,
  BuildingLibraryIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RemittanceNotification {
  id: string;
  amount: number;
  senderName: string;
  senderPhone: string;
  date: Date;
  status: 'pending' | 'claimed';
  claimCode: string;
  txHash: string;
}

interface ClaimOption {
  id: string;
  type: 'bank' | 'cash' | 'mobile';
  name: string;
  icon: string;
  fee: number;
  description: string;
  available: boolean;
}

export default function ReceiverDashboard() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [claimCode, setClaimCode] = useState('');
  const [selectedClaim, setSelectedClaim] = useState<RemittanceNotification | null>(null);
  const [claimMethod, setClaimMethod] = useState<ClaimOption | null>(null);
  const [isSpanish, setIsSpanish] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  // Mock data
  const [notifications] = useState<RemittanceNotification[]>([
    {
      id: '1',
      amount: 150,
      senderName: 'Carlos Mendoza',
      senderPhone: '+34666123456',
      date: new Date(),
      status: 'pending',
      claimCode: 'RMPAY-2024-001',
      txHash: '0x123...abc'
    },
    {
      id: '2',
      amount: 200,
      senderName: 'María González',
      senderPhone: '+34777654321',
      date: new Date(Date.now() - 3600000),
      status: 'pending',
      claimCode: 'RMPAY-2024-002',
      txHash: '0x456...def'
    }
  ]);

  const claimOptions: ClaimOption[] = [
    {
      id: 'bank',
      type: 'bank',
      name: 'Transferencia Bancaria',
      icon: '🏦',
      fee: 0,
      description: 'Recibe directo en tu cuenta bancaria',
      available: true
    },
    {
      id: 'cash',
      type: 'cash',
      name: 'Efectivo en Agente',
      icon: '💵',
      fee: 2,
      description: 'Retira en cualquier agente autorizado',
      available: true
    },
    {
      id: 'mobile',
      type: 'mobile',
      name: 'Billetera Móvil',
      icon: '📱',
      fee: 1,
      description: 'Recibe en tu billetera digital',
      available: false
    }
  ];

  const text = {
    es: {
      title: "Recibir Dinero",
      subtitle: "Verifica tu número para ver transferencias pendientes",
      phoneLabel: "Tu número de teléfono",
      phonePlaceholder: "987654321",
      verify: "Verificar",
      verificationSent: "Código enviado por SMS",
      enterCode: "Ingresa el código de verificación",
      pendingTransfers: "Transferencias Pendientes",
      from: "De",
      amount: "Monto",
      received: "Recibido",
      claimNow: "Reclamar Ahora",
      claimed: "Reclamado",
      selectMethod: "Selecciona método de retiro",
      bankTransfer: "Transferencia Bancaria",
      cashPickup: "Retiro en Efectivo",
      mobileWallet: "Billetera Móvil",
      processingFee: "Comisión de procesamiento",
      youReceive: "Recibes",
      confirmClaim: "Confirmar Retiro",
      claimInstructions: "Instrucciones de Retiro",
      success: "¡Transferencia Reclamada!",
      downloadReceipt: "Descargar Recibo",
      shareCode: "Compartir Código"
    },
    en: {
      title: "Receive Money",
      subtitle: "Verify your number to see pending transfers",
      phoneLabel: "Your phone number",
      phonePlaceholder: "987654321",
      verify: "Verify",
      verificationSent: "Code sent via SMS",
      enterCode: "Enter verification code",
      pendingTransfers: "Pending Transfers",
      from: "From",
      amount: "Amount",
      received: "Received",
      claimNow: "Claim Now",
      claimed: "Claimed",
      selectMethod: "Select withdrawal method",
      bankTransfer: "Bank Transfer",
      cashPickup: "Cash Pickup",
      mobileWallet: "Mobile Wallet",
      processingFee: "Processing fee",
      youReceive: "You receive",
      confirmClaim: "Confirm Withdrawal",
      claimInstructions: "Withdrawal Instructions",
      success: "Transfer Claimed Successfully!",
      downloadReceipt: "Download Receipt",
      shareCode: "Share Code"
    }
  };

  const t = text[isSpanish ? 'es' : 'en'];

  const handleVerifyPhone = () => {
    setIsVerified(true);
  };

  const handleClaimTransfer = (notification: RemittanceNotification) => {
    setSelectedClaim(notification);
  };

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
                <p className="text-sm text-gray-500">Receptor Ecuador 🇪🇨</p>
              </div>
            </div>
            <button 
              onClick={() => setIsSpanish(!isSpanish)}
              className="px-3 py-1 border rounded-md text-sm hover:bg-gray-50"
            >
              {isSpanish ? 'EN' : 'ES'}
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {!isVerified ? (
          /* Phone Verification */
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PhoneIcon className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">{t.title}</CardTitle>
                <p className="text-gray-600 text-sm">{t.subtitle}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.phoneLabel}
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      +593
                    </span>
                    <Input 
                      placeholder={t.phonePlaceholder}
                      className="rounded-l-none"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={handleVerifyPhone}
                  className="w-full bg-gradient-ecuador text-white"
                  disabled={!phoneNumber}
                >
                  {t.verify}
                </Button>
                
                <div className="text-center text-xs text-gray-500">
                  Al verificar aceptas recibir notificaciones SMS
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Main Dashboard */
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Welcome Banner */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-ecuador text-white p-6 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">¡Bienvenido!</h2>
                    <p className="text-blue-100">+593{phoneNumber}</p>
                  </div>
                  <CheckCircleIcon className="w-8 h-8 text-green-300" />
                </div>
              </motion.div>

              {/* Pending Transfers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BanknotesIcon className="w-6 h-6 text-green-600" />
                    <span>{t.pendingTransfers}</span>
                    <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                      {notifications.filter(n => n.status === 'pending').length}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-gray-900">{t.from}: {notification.senderName}</p>
                          <p className="text-sm text-gray-500">{notification.senderPhone}</p>
                          <p className="text-xs text-gray-400">
                            {notification.date.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">${notification.amount}</p>
                          <p className="text-xs text-gray-500">USD</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {notification.claimCode}
                        </div>
                        
                        {notification.status === 'pending' ? (
                          <Button 
                            onClick={() => handleClaimTransfer(notification)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <BanknotesIcon className="w-4 h-4 mr-2" />
                            {t.claimNow}
                          </Button>
                        ) : (
                          <div className="flex items-center text-green-600 text-sm">
                            <CheckCircleIcon className="w-4 h-4 mr-1" />
                            {t.claimed}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Claim with Code */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <QrCodeIcon className="w-6 h-6 text-purple-600" />
                    <span>Reclamar con Código</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-3">
                    <Input 
                      placeholder="RMPAY-2024-XXX"
                      value={claimCode}
                      onChange={(e) => setClaimCode(e.target.value)}
                      className="flex-1"
                    />
                    <Button variant="outline">
                      <QrCodeIcon className="w-4 h-4 mr-2" />
                      Escanear QR
                    </Button>
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                      Reclamar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Total Received */}
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">$2,850</div>
                  <div className="text-sm text-gray-600">Total recibido este año</div>
                  <div className="text-xs text-gray-500 mt-2">
                    15 transferencias completadas
                  </div>
                </CardContent>
              </Card>

              {/* Claim Methods */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Métodos de Retiro Disponibles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {claimOptions.map((option) => (
                    <div key={option.id} className={`p-3 border rounded-lg ${
                      option.available ? 'hover:bg-gray-50 cursor-pointer' : 'opacity-50'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{option.icon}</span>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{option.name}</p>
                          <p className="text-xs text-gray-500">{option.description}</p>
                          <p className="text-xs text-blue-600">
                            Comisión: ${option.fee}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Support */}
              <Card>
                <CardContent className="p-6 text-center">
                  <h3 className="font-medium mb-2">¿Necesitas ayuda?</h3>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      <PhoneIcon className="w-3 h-3 mr-1" />
                      Llamar Soporte
                    </Button>
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      <DocumentTextIcon className="w-3 h-3 mr-1" />
                      Chat en Vivo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Claim Modal */}
      <AnimatePresence>
        {selectedClaim && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedClaim(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BanknotesIcon className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Reclamar ${selectedClaim.amount}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    De: {selectedClaim.senderName}
                  </p>
                </div>

                {!claimMethod ? (
                  /* Method Selection */
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">{t.selectMethod}</h4>
                    {claimOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => option.available && setClaimMethod(option)}
                        disabled={!option.available}
                        className={`w-full p-4 border rounded-lg text-left transition-colors ${
                          option.available 
                            ? 'hover:bg-gray-50 cursor-pointer' 
                            : 'opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{option.icon}</span>
                            <div>
                              <p className="font-medium">{option.name}</p>
                              <p className="text-sm text-gray-500">{option.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              ${(selectedClaim.amount - option.fee).toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Comisión: ${option.fee}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  /* Claim Confirmation */
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Monto original:</span>
                        <span>${selectedClaim.amount}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>{t.processingFee}:</span>
                        <span>-${claimMethod.fee}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-bold">
                        <span>{t.youReceive}:</span>
                        <span className="text-green-600">
                          ${(selectedClaim.amount - claimMethod.fee).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Información de {claimMethod.name}</h4>
                      {claimMethod.type === 'bank' && (
                        <div className="space-y-3">
                          <Input placeholder="Número de cuenta" />
                          <Input placeholder="Banco" />
                          <Input placeholder="Cédula de identidad" />
                        </div>
                      )}
                      {claimMethod.type === 'cash' && (
                        <div className="space-y-3">
                          <Input placeholder="Cédula de identidad" />
                          <select className="w-full p-3 border rounded-md">
                            <option>Seleccionar agente más cercano</option>
                            <option>Banco Pichincha - Centro</option>
                            <option>Banco Guayaquil - Norte</option>
                            <option>Western Union - Sur</option>
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-3">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setClaimMethod(null)}
                      >
                        Atrás
                      </Button>
                      <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                        {t.confirmClaim}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
