import prisma from '../src/config/database';

async function seedUsers() {
  console.log('🌱 Seeding test users...');

  const testUsers = [
    {
      firstName: 'Maria',
      lastName: 'Rodriguez',
      phoneNumber: '+1234567890',
      countryCode: '+1',
      country: 'United States',
      walletAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
    },
    {
      firstName: 'Carlos',
      lastName: 'Mendez',
      phoneNumber: '+525512345678',
      countryCode: '+52',
      country: 'Mexico',
      walletAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
    },
    {
      firstName: 'Ana',
      lastName: 'Silva',
      phoneNumber: '+573012345678',
      countryCode: '+57',
      country: 'Colombia',
      walletAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'
    },
    {
      firstName: 'Juan',
      lastName: 'Perez',
      phoneNumber: '+584123456789',
      countryCode: '+58',
      country: 'Venezuela',
      walletAddress: '0x90F79bf6EB2c4f870365E785982E1f101E93b906'
    }
  ];

  try {
    for (const user of testUsers) {
      const existingUser = await prisma.user.findUnique({
        where: { phoneNumber: user.phoneNumber }
      });

      if (!existingUser) {
        await prisma.user.create({ data: user });
        console.log(`✅ Created user: ${user.firstName} ${user.lastName} (${user.phoneNumber})`);
      } else {
        console.log(`⚠️  User already exists: ${user.phoneNumber}`);
      }
    }

    console.log('🎉 User seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedUsers();
