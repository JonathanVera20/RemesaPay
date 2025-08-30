import winston from 'winston';
import path from 'path';
import config from '../config/config';

// Create logs directory if it doesn't exist
import fs from 'fs';
const logDir = path.dirname(config.log.filePath);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
  })
);

// Custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create the logger
const logger = winston.createLogger({
  level: config.log.level,
  format: fileFormat,
  defaultMeta: { service: 'remesapay-backend' },
  transports: [
    // File transport for all logs
    new winston.transports.File({
      filename: config.log.filePath,
      maxsize: parseInt(config.log.maxSize.replace('m', '')) * 1024 * 1024, // Convert MB to bytes
      maxFiles: config.log.maxFiles,
    }),
    // Separate file for errors
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: parseInt(config.log.maxSize.replace('m', '')) * 1024 * 1024,
      maxFiles: config.log.maxFiles,
    }),
  ],
});

// Add console transport in development
if (config.nodeEnv === 'development') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
  }));
}

// Create specialized loggers for different modules
export const auditLogger = winston.createLogger({
  level: 'info',
  format: fileFormat,
  defaultMeta: { service: 'remesapay-audit' },
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'audit.log'),
      maxsize: parseInt(config.log.maxSize.replace('m', '')) * 1024 * 1024,
      maxFiles: config.log.maxFiles,
    }),
  ],
});

export const securityLogger = winston.createLogger({
  level: 'info',
  format: fileFormat,
  defaultMeta: { service: 'remesapay-security' },
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'security.log'),
      maxsize: parseInt(config.log.maxSize.replace('m', '')) * 1024 * 1024,
      maxFiles: config.log.maxFiles,
    }),
  ],
});

export const transactionLogger = winston.createLogger({
  level: 'info',
  format: fileFormat,
  defaultMeta: { service: 'remesapay-transactions' },
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'transactions.log'),
      maxsize: parseInt(config.log.maxSize.replace('m', '')) * 1024 * 1024,
      maxFiles: config.log.maxFiles,
    }),
  ],
});

// Helper functions for structured logging
export const logRemittance = (action: string, remittanceId: string, data: any) => {
  transactionLogger.info({
    action,
    remittanceId,
    ...data,
    timestamp: new Date().toISOString(),
  });
};

export const logSecurity = (event: string, userId?: string, data?: any) => {
  securityLogger.warn({
    event,
    userId,
    ...data,
    timestamp: new Date().toISOString(),
  });
};

export const logAudit = (action: string, userId?: string, entity?: string, data?: any) => {
  auditLogger.info({
    action,
    userId,
    entity,
    ...data,
    timestamp: new Date().toISOString(),
  });
};

export default logger;
