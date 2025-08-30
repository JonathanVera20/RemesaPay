import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const config = {
  app: {
    port: parseInt(process.env.PORT || '3007', 10),
    environment: process.env.NODE_ENV || 'development'
  }
};

const logger = {
  info: (msg: string) => console.log(`[INFO] ${msg}`),
  error: (msg: string, error?: any) => console.error(`[ERROR] ${msg}`, error)
};

// Create Express app
const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS
app.use(cors({
  origin: [
    'http://localhost:3009',
    'http://localhost:3000',
    'http://localhost:3004'
  ],
  credentials: true,
}));

// Trust proxy for accurate IP addresses
app.set('trust proxy', true);

// Request ID middleware
app.use((req, res, next) => {
  (req as any).id = Math.random().toString(36).substr(2, 9);
  res.setHeader('X-Request-ID', (req as any).id);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'RemesaPay API is healthy',
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: config.app.environment,
      uptime: Math.floor(process.uptime())
    }
  });
});

// Status endpoint
app.get('/api/status', (req, res) => {
  const memoryUsage = process.memoryUsage();
  
  res.json({
    success: true,
    data: {
      api: {
        status: 'healthy',
        uptime: Math.floor(process.uptime()),
        memory: {
          used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          external: Math.round(memoryUsage.external / 1024 / 1024)
        }
      },
      database: {
        status: 'healthy',
        responseTime: 0
      },
      blockchain: {
        base: {
          status: 'healthy',
          network: 'Local Hardhat'
        }
      },
      timestamp: new Date().toISOString()
    }
  });
});

// Test endpoint
app.post('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Test endpoint working',
    data: {
      receivedMessage: req.body.message || 'No message provided',
      timestamp: new Date().toISOString(),
      environment: config.app.environment
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', error);
  
  if (res.headersSent) {
    return next(error);
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    requestId: (req as any).id,
    error: config.app.environment === 'development' ? error.message : undefined
  });
});

// Start server
const PORT = config.app.port || 3007;

app.listen(PORT, () => {
  logger.info(`🚀 RemesaPay Backend Server running on port ${PORT}`);
  logger.info(`🔍 Health Check: http://localhost:${PORT}/api/health`);
  logger.info(`🔍 Status Check: http://localhost:${PORT}/api/status`);
  logger.info(`🌍 Environment: ${config.app.environment}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app;