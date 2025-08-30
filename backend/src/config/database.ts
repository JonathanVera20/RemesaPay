import { PrismaClient } from '@prisma/client';
import config from './config';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: config.databaseUrl,
    },
  },
  log: config.nodeEnv === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Connect function
export const connectDatabase = async () => {
  try {
    await prisma.$connect();
    console.log('📦 Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
