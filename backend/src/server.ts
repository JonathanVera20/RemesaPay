import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from './config/config';
import { logger } from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/users';
import { remittanceRoutes } from './routes/remittances';
import { merchantRoutes } from './routes/merchants';
import { webhookRoutes } from './routes/webhooks';
import { adminRoutes } from './routes/admin';
import { swaggerSpec, swaggerUi } from './config/swagger';
import { initializeRedis } from './services/redis';
import { initializeDatabase } from './config/database';
import * as Sentry from '@sentry/node';

const app = express();

// Initialize Sentry for error tracking
if (config.NODE_ENV === 'production') {
  Sentry.init({
    dsn: config.SENTRY_DSN,
    environment: config.NODE_ENV,
  });
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.RATE_LIMIT_REQUESTS_PER_MINUTE || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(limiter);
app.use(helmet());
app.use(cors({
  origin: config.NODE_ENV === 'production' 
    ? ['https://remesapay.com', 'https://app.remesapay.com']
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));
app.use(compression());
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: config.NODE_ENV,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/remittances', remittanceRoutes);
app.use('/api/merchants', merchantRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/admin', adminRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize services
async function initializeApp() {
  try {
    await initializeDatabase();
    await initializeRedis();
    logger.info('All services initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize services:', error);
    process.exit(1);
  }
}

// Start server
const PORT = config.PORT || 3001;

app.listen(PORT, async () => {
  await initializeApp();
  logger.info(`🚀 RemesaPay Backend Server running on port ${PORT}`);
  logger.info(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
  logger.info(`🌍 Environment: ${config.NODE_ENV}`);
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
