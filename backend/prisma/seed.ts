import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create sample merchants for testing
  const merchants = [
    {
      businessName: 'Farmacia San Juan',
      businessType: 'PHARMACY',
      contactName: 'Maria Rodriguez',
      phone: '+593987654321',
      email: 'maria@farmaciasanjuan.com',
      address: 'Av. Amazonas 123, entre Colon y Orellana',
      city: 'Quito',
      province: 'Pichincha',
      postalCode: '170150',
      latitude: -0.2135,
      longitude: -78.4951,
      licenseNumber: 'FARM-2024-001',
      taxId: '1756789012001',
      verified: true,
      isActive: true,
      commissionRate: 1.5,
      cashLimit: 10000,
      operatingHours: {
        monday: '08:00-20:00',
        tuesday: '08:00-20:00',
        wednesday: '08:00-20:00',
        thursday: '08:00-20:00',
        friday: '08:00-20:00',
        saturday: '08:00-18:00',
        sunday: '09:00-15:00'
      },
      onboardedAt: new Date()
    },
    {
      businessName: 'Tienda La Esquina',
      businessType: 'CONVENIENCE_STORE',
      contactName: 'Carlos Mendez',
      phone: '+593998765432',
      email: 'carlos@tiendalaesquina.com',
      address: 'Calle Sucre 456, y Garcia Moreno',
      city: 'Guayaquil',
      province: 'Guayas',
      postalCode: '090150',
      latitude: -2.1894,
      longitude: -79.8890,
      licenseNumber: 'TIENDA-2024-002',
      taxId: '0987654321001',
      verified: true,
      isActive: true,
      commissionRate: 2.0,
      cashLimit: 5000,
      operatingHours: {
        monday: '06:00-22:00',
        tuesday: '06:00-22:00',
        wednesday: '06:00-22:00',
        thursday: '06:00-22:00',
        friday: '06:00-22:00',
        saturday: '06:00-22:00',
        sunday: '07:00-20:00'
      },
      onboardedAt: new Date()
    },
    {
      businessName: 'Banco del Barrio',
      businessType: 'BANK_AGENT',
      contactName: 'Ana Flores',
      phone: '+593976543210',
      email: 'ana@bancodelbarrio.com',
      address: 'Av. 9 de Octubre 789, y Malecón',
      city: 'Guayaquil',
      province: 'Guayas',
      postalCode: '090150',
      latitude: -2.1709,
      longitude: -79.9224,
      licenseNumber: 'BANCO-2024-003',
      taxId: '1234567890001',
      verified: true,
      isActive: true,
      commissionRate: 1.0,
      cashLimit: 50000,
      operatingHours: {
        monday: '08:00-17:00',
        tuesday: '08:00-17:00',
        wednesday: '08:00-17:00',
        thursday: '08:00-17:00',
        friday: '08:00-17:00',
        saturday: '09:00-13:00',
        sunday: 'closed'
      },
      onboardedAt: new Date()
    },
    {
      businessName: 'Casa de Cambio Central',
      businessType: 'EXCHANGE_HOUSE',
      contactName: 'Luis Vargas',
      phone: '+593965432109',
      email: 'luis@casacambiocentral.com',
      address: 'Av. Patria 321, y 12 de Octubre',
      city: 'Quito',
      province: 'Pichincha',
      postalCode: '170150',
      latitude: -0.1807,
      longitude: -78.4678,
      licenseNumber: 'CAMBIO-2024-004',
      taxId: '5678901234001',
      verified: true,
      isActive: true,
      commissionRate: 0.8,
      cashLimit: 100000,
      operatingHours: {
        monday: '09:00-18:00',
        tuesday: '09:00-18:00',
        wednesday: '09:00-18:00',
        thursday: '09:00-18:00',
        friday: '09:00-18:00',
        saturday: '09:00-14:00',
        sunday: 'closed'
      },
      onboardedAt: new Date()
    }
  ];

  console.log('Creating merchants...');
  for (const merchantData of merchants) {
    const merchant = await prisma.merchant.upsert({
      where: { phone: merchantData.phone },
      update: merchantData,
      create: merchantData
    });

    // Create merchant balance
    await prisma.merchantBalance.upsert({
      where: {
        merchantId_currency: {
          merchantId: merchant.id,
          currency: 'USDC'
        }
      },
      update: {},
      create: {
        merchantId: merchant.id,
        currency: 'USDC',
        availableBalance: '1000.00',
        pendingBalance: '0.00'
      }
    });

    console.log(`✓ Created merchant: ${merchantData.businessName}`);
  }

  // Create sample users for testing
  const users = [
    {
      phoneNumber: '+593912345678',
      email: 'juan.perez@email.com',
      firstName: 'Juan',
      lastName: 'Perez',
      nationalId: '1234567890',
      kycStatus: 'VERIFIED',
      isActive: true,
      lastLoginAt: new Date()
    },
    {
      phoneNumber: '+593923456789',
      email: 'maria.garcia@email.com',
      firstName: 'Maria',
      lastName: 'Garcia',
      nationalId: '0987654321',
      kycStatus: 'VERIFIED',
      isActive: true,
      lastLoginAt: new Date()
    },
    {
      phoneNumber: '+593934567890',
      email: 'carlos.rodriguez@email.com',
      firstName: 'Carlos',
      lastName: 'Rodriguez',
      nationalId: '1122334455',
      kycStatus: 'PENDING',
      isActive: true,
      lastLoginAt: new Date()
    }
  ];

  console.log('Creating users...');
  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { phoneNumber: userData.phoneNumber },
      update: userData,
      create: userData
    });

    console.log(`✓ Created user: ${userData.firstName} ${userData.lastName}`);
  }

  // Create sample exchange rates
  console.log('Creating exchange rates...');
  const exchangeRates = [
    {
      fromCurrency: 'USD',
      toCurrency: 'USDC',
      rate: '1.0000',
      source: 'Manual',
      timestamp: new Date()
    },
    {
      fromCurrency: 'USDC',
      toCurrency: 'USD',
      rate: '1.0000',
      source: 'Manual',
      timestamp: new Date()
    },
    {
      fromCurrency: 'USD',
      toCurrency: 'EUR',
      rate: '0.8500',
      source: 'CoinGecko',
      timestamp: new Date()
    },
    {
      fromCurrency: 'EUR',
      toCurrency: 'USD',
      rate: '1.1765',
      source: 'CoinGecko',
      timestamp: new Date()
    }
  ];

  for (const rateData of exchangeRates) {
    await prisma.exchangeRate.create({
      data: rateData
    });
  }

  console.log('✓ Created exchange rates');

  // Create sample admin user (for testing verification endpoints)
  const adminPassword = await bcrypt.hash('admin123', 12);
  await prisma.user.upsert({
    where: { phoneNumber: '+593900000000' },
    update: {},
    create: {
      phoneNumber: '+593900000000',
      email: 'admin@remesapay.com',
      firstName: 'Admin',
      lastName: 'User',
      nationalId: '0000000000',
      kycStatus: 'VERIFIED',
      isActive: true,
      lastLoginAt: new Date()
    }
  });

  console.log('✓ Created admin user');

  // Create some sample remittances for demonstration
  const sampleRemittances = [
    {
      senderId: (await prisma.user.findUnique({ where: { phoneNumber: '+593912345678' } }))?.id,
      recipientPhone: '+593923456789',
      amount: '100.00',
      currency: 'USDC',
      status: 'COMPLETED',
      withdrawalCode: 'ABC123',
      expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72 hours from now
      blockchainTxHash: '0x1234567890abcdef1234567890abcdef12345678',
      network: 'base',
      feeAmount: '1.50',
      exchangeRate: '1.0000',
      merchantId: (await prisma.merchant.findFirst({ where: { businessName: 'Farmacia San Juan' } }))?.id
    },
    {
      senderId: (await prisma.user.findUnique({ where: { phoneNumber: '+593923456789' } }))?.id,
      recipientPhone: '+593934567890',
      amount: '50.00',
      currency: 'USDC',
      status: 'PENDING_CLAIM',
      withdrawalCode: 'XYZ789',
      expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
      blockchainTxHash: '0xabcdef1234567890abcdef1234567890abcdef12',
      network: 'base',
      feeAmount: '0.75',
      exchangeRate: '1.0000'
    }
  ];

  console.log('Creating sample remittances...');
  for (const remittanceData of sampleRemittances) {
    if (remittanceData.senderId) {
      await prisma.remittance.create({
        data: remittanceData
      });
      console.log(`✓ Created remittance: $${remittanceData.amount}`);
    }
  }

  console.log('🎉 Database seeding completed successfully!');
  
  // Print summary
  const merchantCount = await prisma.merchant.count();
  const userCount = await prisma.user.count();
  const remittanceCount = await prisma.remittance.count();
  
  console.log('\n📊 Seeding Summary:');
  console.log(`   Merchants: ${merchantCount}`);
  console.log(`   Users: ${userCount}`);
  console.log(`   Remittances: ${remittanceCount}`);
  console.log(`   Exchange Rates: ${exchangeRates.length}`);
  console.log('\n✅ Your RemesaPay backend is ready for testing!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
