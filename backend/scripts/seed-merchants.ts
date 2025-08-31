import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedUsers() {
  console.log('Seeding test users...');

  const users = [
    {
      firstName: 'Maria',
      lastName: 'Rodriguez',
      phoneNumber: '+584121234567',
      countryCode: '+58',
      email: 'maria@example.com',
      country: 'Venezuela',
      walletAddress: '0x742d35Cc6634C0532925a3b8D098e8E3fD5f9B3f',
      isActive: true
    },
    {
      firstName: 'Carlos',
      lastName: 'Garcia',
      phoneNumber: '+525512345678',
      countryCode: '+52',
      email: 'carlos@example.com',
      country: 'Mexico',
      walletAddress: '0x8ba1f109551bD432803012645Hac136c23d12345',
      isActive: true
    },
    {
      firstName: 'Ana',
      lastName: 'Gutierrez',
      phoneNumber: '+573001234567',
      countryCode: '+57',
      email: 'ana@example.com',
      country: 'Colombia',
      walletAddress: '0x9fB1aE5c12d4f3B2c8e9A0b5c6d7e8f9a0b1c2d3',
      isActive: true
    },
    {
      firstName: 'Luis',
      lastName: 'Martinez',
      phoneNumber: '+12125551234',
      countryCode: '+1',
      email: 'luis@example.com',
      country: 'USA',
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
      isActive: true
    }
  ];

  for (const user of users) {
    const existing = await prisma.user.findUnique({
      where: { phoneNumber: user.phoneNumber }
    });

    if (existing) {
      console.log(`User ${user.firstName} ${user.lastName} already exists`);
      continue;
    }

    const created = await prisma.user.create({
      data: user
    });

    console.log(`Created user: ${created.firstName} ${created.lastName} (${created.phoneNumber})`);
  }

  console.log('Seeding completed!');
}

seedUsers()
  .catch((e) => {
    console.error('Error seeding users:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
