import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

import config from './config/config';
import logger from './utils/logger';
import apiRoutes from './routes/index';
import { connectDatabase } from './config/database';
import redisService from './services/redis';
import exchangeRateService from './services/exchangeRate.service';

// Create Express app
const app = express();
const server = createServer(app);

// Socket.IO for real-time notifications
const io = new SocketIOServer(server, {
  cors: {
    origin: [
      config.app.frontendUrl,
      'http://localhost:3000',
      'http://localhost:3004'
    ],
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy for accurate IP addresses (for load balancers, etc.)
app.set('trust proxy', true);

// Request ID middleware
app.use((req, res, next) => {
  (req as any).id = Math.random().toString(36).substr(2, 9);
  res.setHeader('X-Request-ID', (req as any).id);
  next();
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`Socket.IO client connected: ${socket.id}`);

  // Join room based on phone number (for targeted notifications)
  socket.on('join', (data) => {
    if (data.phoneNumber) {
      socket.join(`user:${data.phoneNumber}`);
      logger.info(`Socket ${socket.id} joined room: user:${data.phoneNumber}`);
    }
  });

  // Join merchant room
  socket.on('join_merchant', (data) => {
    if (data.merchantId) {
      socket.join(`merchant:${data.merchantId}`);
      logger.info(`Socket ${socket.id} joined room: merchant:${data.merchantId}`);
    }
  });

  socket.on('disconnect', () => {
    logger.info(`Socket.IO client disconnected: ${socket.id}`);
  });
});

// Make io available globally for services
declare global {
  var io: SocketIOServer;
}
global.io = io;

// API Routes
app.use('/api', apiRoutes);

// Serve static files in production
if (config.app.environment === 'production') {
  const staticPath = path.join(__dirname, '../public');
  app.use(express.static(staticPath));
  
  // Serve frontend app for any non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

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

// Graceful shutdown handler
const gracefulShutdown = async () => {
  logger.info('Received shutdown signal, starting graceful shutdown...');
  
  // Close HTTP server
  server.close(() => {
    logger.info('HTTP server closed');
  });

  // Close Socket.IO server
  io.close(() => {
    logger.info('Socket.IO server closed');
  });

  // Close database connections
  try {
    const prisma = await import('./config/database');
    await prisma.default.$disconnect();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error closing database connection:', error);
  }

  // Close Redis connection
  try {
    await redisService.disconnect();
    logger.info('Redis connection closed');
  } catch (error) {
    logger.error('Error closing Redis connection:', error);
  }

  logger.info('Graceful shutdown completed');
  process.exit(0);
};

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Initialize services and start server
async function startServer() {
  try {
    logger.info('Starting RemesaPay backend server...');

    // Test database connection
    logger.info('Connecting to database...');
    await connectDatabase();
    logger.info('Database connected successfully');

    // Test Redis connection
    logger.info('Connecting to Redis...');
    await redisService.ping();
    logger.info('Redis connected successfully');

    // Warm up exchange rate cache
    logger.info('Warming up exchange rate cache...');
    await exchangeRateService.warmupCache();
    logger.info('Exchange rate cache warmed up');

    // Start server
    const port = config.app.port;
    server.listen(port, () => {
      logger.info(`🚀 RemesaPay API server running on port ${port}`);
      logger.info(`📚 API Documentation: http://localhost:${port}/api/docs`);
      logger.info(`🔍 Health Check: http://localhost:${port}/api/health`);
      logger.info(`🌍 Environment: ${config.app.environment}`);
      
      if (config.app.environment === 'development') {
        logger.info(`🔧 Test Endpoint: http://localhost:${port}/api/test`);
      }
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

export { app, server, io };
