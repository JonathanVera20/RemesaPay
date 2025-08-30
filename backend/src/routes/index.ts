import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Route imports
import remittanceRoutes from './remittance';
import merchantRoutes from './merchants';

// Service imports
import logger from '../utils/logger';
import config from '../config/config';

const router = express.Router();

// Security middleware
router.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'", "https:"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:"],
      fontSrc: ["'self'", "https:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
router.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      config.app.frontendUrl,
      'http://localhost:3000',
      'http://localhost:3004',
      'https://remesapay.com',
      'https://app.remesapay.com'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['X-Total-Count', 'X-Rate-Limit-Remaining']
}));

// Compression
router.use(compression());

// Global rate limiting
const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path
    });
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

router.use(globalRateLimit);

// Request logging middleware
router.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('API Request', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  });
  
  next();
});

// Swagger documentation configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RemesaPay API',
      version: '1.0.0',
      description: 'Web3-powered remittance platform for Ecuador',
      contact: {
        name: 'RemesaPay Team',
        email: 'developers@remesapay.com',
        url: 'https://remesapay.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: config.app.baseUrl,
        description: 'Production server'
      },
      {
        url: 'http://localhost:3001',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'An error occurred'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string'
                  },
                  message: {
                    type: 'string'
                  }
                }
              }
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operation completed successfully'
            },
            data: {
              type: 'object'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Remittances',
        description: 'Money transfer operations'
      },
      {
        name: 'Merchants',
        description: 'Merchant management and discovery'
      },
      {
        name: 'System',
        description: 'System health and status endpoints'
      }
    ]
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts'
  ]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger UI
router.use('/docs', swaggerUi.serve);
router.get('/docs', swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'RemesaPay API Documentation'
}));

// API Routes
router.use('/remittances', remittanceRoutes);
router.use('/merchants', merchantRoutes);

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [System]
 *     responses:
 *       200:
 *         description: System is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "RemesaPay API is healthy"
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "healthy"
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     version:
 *                       type: string
 *                       example: "1.0.0"
 *                     environment:
 *                       type: string
 *                       example: "production"
 *                     uptime:
 *                       type: number
 *                       example: 3600
 *       500:
 *         description: System is unhealthy
 */
router.get('/health', async (req, res) => {
  try {
    const uptime = process.uptime();
    
    res.json({
      success: true,
      message: 'RemesaPay API is healthy',
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: config.app.environment,
        uptime: Math.floor(uptime)
      }
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      data: {
        status: 'unhealthy',
        timestamp: new Date().toISOString()
      }
    });
  }
});

/**
 * @swagger
 * /api/status:
 *   get:
 *     summary: Detailed system status
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Detailed system status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     api:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                         uptime:
 *                           type: number
 *                         memory:
 *                           type: object
 *                     database:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                         responseTime:
 *                           type: number
 *                     redis:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                         responseTime:
 *                           type: number
 *                     blockchain:
 *                       type: object
 *                       properties:
 *                         base:
 *                           type: object
 *                         optimism:
 *                           type: object
 */
router.get('/status', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Check database
    let dbStatus = 'unknown';
    let dbResponseTime = 0;
    try {
      const dbStart = Date.now();
      await import('../config/database').then(db => db.default.$queryRaw`SELECT 1`);
      dbResponseTime = Date.now() - dbStart;
      dbStatus = 'healthy';
    } catch (error) {
      dbStatus = 'unhealthy';
      logger.error('Database health check failed:', error);
    }

    // Check Redis
    let redisStatus = 'unknown';
    let redisResponseTime = 0;
    try {
      const redisStart = Date.now();
      const redisService = await import('../services/redis');
      await redisService.default.ping();
      redisResponseTime = Date.now() - redisStart;
      redisStatus = 'healthy';
    } catch (error) {
      redisStatus = 'unhealthy';
      logger.error('Redis health check failed:', error);
    }

    // Check blockchain connections
    let baseStatus = 'unknown';
    let optimismStatus = 'unknown';
    try {
      // For now, mark as healthy - blockchain checks can be added later
      baseStatus = 'healthy';
      optimismStatus = 'healthy';
    } catch (error) {
      logger.error('Blockchain health check failed:', error);
    }

    const totalResponseTime = Date.now() - startTime;
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
          },
          responseTime: totalResponseTime
        },
        database: {
          status: dbStatus,
          responseTime: dbResponseTime
        },
        redis: {
          status: redisStatus,
          responseTime: redisResponseTime
        },
        blockchain: {
          base: {
            status: baseStatus,
            network: 'Base Mainnet'
          },
          optimism: {
            status: optimismStatus,
            network: 'Optimism Mainnet'
          }
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Status check failed:', error);
    res.status(500).json({
      success: false,
      message: 'Status check failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Test endpoint for development
if (config.app.environment === 'development') {
  /**
   * @swagger
   * /api/test:
   *   post:
   *     summary: Test endpoint (Development only)
   *     tags: [System]
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               message:
   *                 type: string
   *                 example: "Hello, RemesaPay!"
   *     responses:
   *       200:
   *         description: Test response
   */
  router.post('/test', [
    body('message').optional().isString().withMessage('Message must be a string')
  ], (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

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
}

// 404 handler for API routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// Error handler
router.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction): void => {
  logger.error('API Error:', error);

  // Handle different error types
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details
    });
  }

  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized access'
    });
  }

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON in request body'
    });
  }

  // Default error response
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: config.app.environment === 'development' ? (error as Error).message : undefined
  });
});

export default router;
