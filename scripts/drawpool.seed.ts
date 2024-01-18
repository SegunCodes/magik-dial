import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedDrawPools() {
  const drawPools = [
    {
      productId: '0e4bd28c-cf70-45fb-93a7-94c3f45b1943',
      msisdns: '9876543210,1234567890',
      validUntil: new Date('2023-01-01T23:59:00.000Z'), // Replace with your desired date
    },
    {
      productId: '54b9d24c-9b3d-4601-9812-1efcb80e6857',
      msisdns: '9876543210,1234567890',  validUntil: new Date('2023-01-02T23:59:00.000Z'), // Replace with your desired date
    
    },
    // Add more draw pool entries as needed
  ];

  try {
    for (const drawPool of drawPools) {
      await prisma.drawPool.create({
        data: drawPool,
      });
      console.log(`DrawPool for productId "${drawPool.productId}" seeded successfully.`);
    }
  } catch (error) {
    console.error('Error seeding draw pools:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDrawPools();
