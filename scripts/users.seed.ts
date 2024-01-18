import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedUsers() {
  const users = [
    {
      msisdn: '1234567890',
      isBanned: false,
      status: 'Active',
    },
    {
      msisdn: '9876543210',
      bankAccountNumber: '9876543210',
      bankName: 'Bank B',
      bankAccountCode: 'XYZ789',
      bankAccountName: 'Test User 1',
      balance: 2000.0,
      isBanned: false,
      status: 'Active',
    },
  ];

  try {
    for (const user of users) {
      const existingUser = await prisma.user.findUnique({
        where: { msisdn: user.msisdn },
      });

      if (!existingUser) {
        await prisma.user.create({
          data: user,
        });
        console.log(`User with MSISDN "${user.msisdn}" seeded successfully.`);
      } else {
        console.log(`User with MSISDN "${user.msisdn}" already exists. Skipping seeding.`);
      }
    }
  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedUsers();
