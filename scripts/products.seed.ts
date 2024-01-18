import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

enum ProductTypeEnum {
  ONESHOT = 'ONESHOT',
  SUBSCRIPTION = 'SUBSCRIPTION',
}

async function seedProducts() {
  const products = [
    {
      externalId: 'unique_id_1',
      name: 'One Million Bag',
      type: ProductTypeEnum.SUBSCRIPTION,
      serviceId: 'your_service_id_1',
      amount: 1000.0,
      description: 'A raffle draw for a chance to win prizes.',
      isActive: true,
      shortCode: '123',
      entryChannels: 'SMS',
      networks: 'Airtel, MTN, Glo',
      productKeyword: 'P1'
    },
    {
      externalId: 'unique_id_2',
      name: 'ChopChop Instant win',
      type: ProductTypeEnum.SUBSCRIPTION,
      serviceId: 'your_service_id_2',
      amount: 500.0,
      description: 'A daily lottery game with frequent drawings.',
      isActive: true,
      shortCode: '456',
      entryChannels: 'Web',
      networks: 'Airtel, MTN',
      productKeyword: 'P2'
    },
    {
      externalId: 'unique_id_3',
      name: 'Mega Money',
      type: ProductTypeEnum.ONESHOT,
      serviceId: 'your_service_id_3',
      amount: 2000.0,
      description: 'Another daily lottery game with frequent drawings.',
      isActive: true,
      shortCode: '789',
      entryChannels: 'SMS',
      networks: 'Glo, MTN',
      productKeyword: 'P3'
    },
    {
      externalId: 'unique_id_4',
      name: 'Instant ¾',
      type: ProductTypeEnum.ONESHOT,
      serviceId: 'your_service_id_4',
      amount: 50.0,
      description: 'A lottery game where players pick three numbers to match and win prizes.',
      isActive: true,
      shortCode: '987',
      entryChannels: 'Web, SMS',
      networks: 'Airtel, Glo',
      productKeyword: 'P4'
    },
    {
      externalId: 'unique_id_5',
      name: 'Fast Cash',
      type: ProductTypeEnum.SUBSCRIPTION,
      serviceId: 'your_service_id_5',
      amount: 500.0,
      description: 'A raffle draw via SMS for a chance to win prizes.',
      isActive: true,
      shortCode: '654',
      entryChannels: 'SMS',
      networks: 'MTN',
      productKeyword: 'P5'
    },
  ];

  try {
    for (const product of products) {
      const existingProduct = await prisma.product.findUnique({
        where: { externalId: product.externalId },
      });

      if (!existingProduct) {
        await prisma.product.create({
          data: product,
        });
        console.log(`Product "${product.name}" seeded successfully.`);
      } else {
        console.log(`Product "${product.name}" already exists. Skipping seeding.`);
      }
    }
  } catch (error) {
    console.error('Error seeding products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedProducts();
