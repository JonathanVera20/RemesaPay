import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import config from './config/config';
import logger from './utils/logger';
import apiRoutes from './routes/index';
import * as Sentry from '@sentry/node';

const app = express();

// Initialize Sentry for error tracking
if (config.app.environment === 'production') {
  Sentry.init({
    dsn: config.app.sentryDsn,
    environment: config.app.environment,
  });
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(limiter);
app.use(helmet());
app.use(cors({
  origin: config.app.environment === 'production' 
    ? ['https://remesapay.com', 'https://app.remesapay.com']
    : ['http://localhost:3000', 'http://localhost:3009', 'http://localhost:3007'],
  credentials: true,
}));
app.use(compression());
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api', apiRoutes);

// Start server
const PORT = config.app.port || 3007;

app.listen(PORT, () => {
  logger.info(`🚀 RemesaPay Backend Server running on port ${PORT}`);
  logger.info(`📚 API Documentation available at http://localhost:${PORT}/api/docs`);
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
