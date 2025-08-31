import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

interface Config {
  // Server
  port: number;
  nodeEnv: string;
  apiVersion: string;
  
  // App
  app: {
    port: number;
    environment: string;
    baseUrl: string;
    frontendUrl: string;
  };
  
  // Database
  databaseUrl: string;
  
  // JWT
  jwtSecret: string;
  jwtExpiresIn: string;
  refreshTokenSecret: string;
  refreshTokenExpiresIn: string;
  
  // Blockchain
  base: {
    rpcUrl: string;
    chainId: number;
    usdcAddress: string;
    remesaPayContract: string;
    merchantRegistryContract: string;
  };
  optimism: {
    rpcUrl: string;
    chainId: number;
    usdcAddress: string;
    remesaPayContract: string;
    merchantRegistryContract: string;
  };
  
  // Wallet
  operatorPrivateKey: string;
  treasuryAddress: string;
  
  // External APIs
  coinMarketCapApiKey: string;
  coinGeckoApiKey: string;
  googleMapsApiKey: string;
  mapboxAccessToken: string;
  
  // Communications
  twilio: {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
    whatsappNumber: string;
  };
  sendGrid: {
    apiKey: string;
    fromEmail: string;
    fromName: string;
  };
  
  // Redis
  redis: {
    url: string;
    password?: string;
    db: number;
  };
  
  // AWS
  aws: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    s3Bucket: string;
    s3BucketRegion: string;
  };
  
  // ENS
  ens: {
    providerUrl: string;
    domain: string;
  };
  
  // Security
  corsOrigin: string[];
  bcryptRounds: number;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  
  // Monitoring
  sentryDsn?: string;
  datadogApiKey?: string;
  
  // Compliance
  amlProviderApiKey?: string;
  sanctionsListApiKey?: string;
  
  // Ecuador
  ecuador: {
    timezone: string;
    currency: string;
    maxRemittanceAmount: number;
  };
  
  // Gas
  gasPriceOracleUrl: string;
  gasStationApiKey?: string;
  
  // WebSocket
  socketIoCorsOrigin: string[];
  
  // Webhooks
  webhookSecret: string;
  
  // Feature Flags
  features: {
    enableKycVerification: boolean;
    enableLargeAmounts: boolean;
    enableMerchantOnboarding: boolean;
    enableSmsNotifications: boolean;
    enableWhatsappNotifications: boolean;
  };
  
  // Logging
  log: {
    level: string;
    filePath: string;
    maxSize: string;
    maxFiles: number;
  };
  
  // Development
  swaggerEnabled: boolean;
  debugMode: boolean;
}

const config: Config = {
  // Server
  port: parseInt(process.env.PORT || '3002', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiVersion: process.env.API_VERSION || 'v1',
  
  // App
  app: {
    port: parseInt(process.env.PORT || '3002', 10),
    environment: process.env.NODE_ENV || 'development',
    baseUrl: process.env.BASE_URL || 'http://localhost:3002',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3005',
  },
  
  // Database
  databaseUrl: process.env.DATABASE_URL || '',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || '',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
  
  // Blockchain
  base: {
    rpcUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
    chainId: parseInt(process.env.BASE_CHAIN_ID || '8453', 10),
    usdcAddress: process.env.BASE_USDC_ADDRESS || '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    remesaPayContract: process.env.REMESA_PAY_CONTRACT_BASE || '',
    merchantRegistryContract: process.env.MERCHANT_REGISTRY_BASE || '',
  },
  optimism: {
    rpcUrl: process.env.OPTIMISM_RPC_URL || 'https://mainnet.optimism.io',
    chainId: parseInt(process.env.OPTIMISM_CHAIN_ID || '10', 10),
    usdcAddress: process.env.OPTIMISM_USDC_ADDRESS || '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
    remesaPayContract: process.env.REMESA_PAY_CONTRACT_OPTIMISM || '',
    merchantRegistryContract: process.env.MERCHANT_REGISTRY_OPTIMISM || '',
  },
  
  // Wallet
  operatorPrivateKey: process.env.OPERATOR_PRIVATE_KEY || '',
  treasuryAddress: process.env.TREASURY_ADDRESS || '',
  
  // External APIs
  coinMarketCapApiKey: process.env.COINMARKETCAP_API_KEY || '',
  coinGeckoApiKey: process.env.COINGECKO_API_KEY || '',
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  mapboxAccessToken: process.env.MAPBOX_ACCESS_TOKEN || '',
  
  // Communications
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
    whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER || '',
  },
  sendGrid: {
    apiKey: process.env.SENDGRID_API_KEY || '',
    fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@remesapay.com',
    fromName: process.env.SENDGRID_FROM_NAME || 'RemesaPay',
  },
  
  // Redis
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },
  
  // AWS
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'us-east-1',
    s3Bucket: process.env.AWS_S3_BUCKET || 'remesapay-documents',
    s3BucketRegion: process.env.AWS_S3_BUCKET_REGION || 'us-east-1',
  },
  
  // ENS
  ens: {
    providerUrl: process.env.ENS_PROVIDER_URL || '',
    domain: process.env.ENS_DOMAIN || 'remesapay.eth',
  },
  
  // Security
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  
  // Monitoring
  sentryDsn: process.env.SENTRY_DSN,
  datadogApiKey: process.env.DATADOG_API_KEY,
  
  // Compliance
  amlProviderApiKey: process.env.AML_PROVIDER_API_KEY,
  sanctionsListApiKey: process.env.SANCTIONS_LIST_API_KEY,
  
  // Ecuador
  ecuador: {
    timezone: process.env.ECUADOR_TIMEZONE || 'America/Guayaquil',
    currency: process.env.ECUADOR_CURRENCY || 'USD',
    maxRemittanceAmount: parseInt(process.env.MAX_REMITTANCE_AMOUNT || '999', 10),
  },
  
  // Gas
  gasPriceOracleUrl: process.env.GAS_PRICE_ORACLE_URL || '',
  gasStationApiKey: process.env.GAS_STATION_API_KEY,
  
  // WebSocket
  socketIoCorsOrigin: (process.env.SOCKET_IO_CORS_ORIGIN || 'http://localhost:3000').split(','),
  
  // Webhooks
  webhookSecret: process.env.WEBHOOK_SECRET || '',
  
  // Feature Flags
  features: {
    enableKycVerification: process.env.ENABLE_KYC_VERIFICATION === 'true',
    enableLargeAmounts: process.env.ENABLE_LARGE_AMOUNTS === 'true',
    enableMerchantOnboarding: process.env.ENABLE_MERCHANT_ONBOARDING === 'true',
    enableSmsNotifications: process.env.ENABLE_SMS_NOTIFICATIONS === 'true',
    enableWhatsappNotifications: process.env.ENABLE_WHATSAPP_NOTIFICATIONS === 'true',
  },
  
  // Logging
  log: {
    level: process.env.LOG_LEVEL || 'info',
    filePath: process.env.LOG_FILE_PATH || './logs/app.log',
    maxSize: process.env.LOG_MAX_SIZE || '10m',
    maxFiles: parseInt(process.env.LOG_MAX_FILES || '5', 10),
  },
  
  // Development
  swaggerEnabled: process.env.SWAGGER_ENABLED === 'true',
  debugMode: process.env.DEBUG_MODE === 'true',
};

// Validation
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'OPERATOR_PRIVATE_KEY',
  'TREASURY_ADDRESS',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Required environment variable ${envVar} is not set`);
  }
}

export default config;
