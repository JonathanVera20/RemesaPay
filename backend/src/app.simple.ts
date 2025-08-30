import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3005',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3005'
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'RemesaPay Backend is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    name: 'RemesaPay API',
    version: '1.0.0',
    description: 'Backend API for RemesaPay cross-border remittance platform',
    endpoints: [
      'GET /health - Health check',
      'GET /api/info - API information',
      'GET /api/rates - Exchange rates',
      'POST /api/remittances - Send remittance',
      'GET /api/remittances - Get remittances'
    ]
  });
});

// Mock exchange rates endpoint
app.get('/api/rates', (req, res) => {
  res.json({
    base: 'USD',
    rates: {
      EUR: 0.85,
      GBP: 0.73,
      JPY: 110.0,
      CAD: 1.25,
      AUD: 1.35,
      CHF: 0.92,
      CNY: 6.45,
      INR: 74.5
    },
    timestamp: new Date().toISOString()
  });
});

// Mock remittances endpoint
app.get('/api/remittances', (req, res) => {
  res.json({
    remittances: [
      {
        id: 1,
        amount: 100,
        currency: 'USD',
        recipient: '+593987654321',
        status: 'pending',
        fee: 0.5,
        netAmount: 99.5,
        timestamp: new Date().toISOString()
      }
    ]
  });
});

app.post('/api/remittances', (req, res) => {
  const { amount, recipient, currency } = req.body;
  
  // Simple validation
  if (!amount || !recipient || !currency) {
    return res.status(400).json({
      error: 'Missing required fields: amount, recipient, currency'
    });
  }

  // Mock response
  const fee = amount * 0.005; // 0.5% fee
  const netAmount = amount - fee;

  return res.json({
    id: Math.floor(Math.random() * 10000),
    amount,
    currency,
    recipient,
    fee,
    netAmount,
    status: 'sent',
    transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 RemesaPay Backend Server Started!');
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('🔗 Available endpoints:');
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log(`   GET  http://localhost:${PORT}/api/info`);
  console.log(`   GET  http://localhost:${PORT}/api/rates`);
  console.log(`   GET  http://localhost:${PORT}/api/remittances`);
  console.log(`   POST http://localhost:${PORT}/api/remittances`);
});

export default app;
