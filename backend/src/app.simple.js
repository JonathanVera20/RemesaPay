const express = require('express');
const cors = require('cors');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true
}));
app.use(express.json());

// Remittance routes
app.post('/api/remittances/send', [
  body('senderAddress').isEthereumAddress().withMessage('Invalid sender address'),
  body('receiverPhone').isMobilePhone('any').withMessage('Invalid phone number'),
  body('amountUsd').isFloat({ min: 10, max: 10000 }).withMessage('Amount must be between $10 and $10,000'),
  body('chainId').isInt().withMessage('Invalid chain ID')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { senderAddress, receiverPhone, amountUsd, chainId } = req.body;

  res.json({
    success: true,
    message: 'Remittance initiated successfully',
    data: {
      remittanceId: 'rem_' + Math.random().toString(36).substr(2, 9),
      txHash: '0x' + Math.random().toString(16).substr(2, 64),
      sender: senderAddress,
      receiver: receiverPhone,
      amount: amountUsd,
      chainId,
      status: 'pending',
      timestamp: new Date().toISOString()
    }
  });
});

app.post('/api/remittances/calculate-fee', (req, res) => {
  const { amount } = req.body;
  const fee = parseFloat(amount) * 0.005; // 0.5% fee
  
  res.json({
    success: true,
    data: {
      amount: parseFloat(amount),
      fee: fee,
      netAmount: parseFloat(amount) - fee
    }
  });
});

app.get('/api/remittances/:id', (req, res) => {
  const { id } = req.params;
  
  res.json({
    success: true,
    data: {
      id,
      sender: '0x1234567890123456789012345678901234567890',
      receiver: '+1234567890',
      amount: '100.00',
      status: 'pending',
      timestamp: new Date().toISOString()
    }
  });
});

// Status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    message: 'RemesaPay Backend API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('API Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 RemesaPay Backend running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`❤️  Health check at http://localhost:${PORT}/health`);
});
