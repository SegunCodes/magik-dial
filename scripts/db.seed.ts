import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedAdmin() {
  const adminData = {
    name: process.env.ADMIN_NAME || 'coder',
    email: process.env.ADMIN_EMAIL || 'admin@admin.com',
    password: process.env.ADMIN_PASSWORD || 'admin_password', // You can generate or retrieve a hashed password here
    accountType: process.env.ADMIN_ACCOUNT_TYPE || 'super_admin',
    isBanned: false,
    twoFaEnabled: false,
  };

  try {
    // Check if the admin account already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: adminData.email },
    });

    // If admin doesn't exist, create the admin account
    if (!existingAdmin) {
      // Hash the password before storing it
      const hashedPassword = await bcrypt.hash(adminData.password, 10);

      await prisma.admin.create({
        data: {
          ...adminData,
          password: hashedPassword,
        },
      });
      console.log('Admin account seeded successfully.');
    } else {
      console.log('Admin account already exists. Skipping seeding.');
    }
  } catch (error) {
    console.error('Error seeding admin account:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();
