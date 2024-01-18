import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function findAdminByEmail(email: string) {
  return prisma.admin.findUnique({ where: { email } });
}

export async function findAdminByResetToken(resetToken: string) {
  return prisma.admin.findFirst({
    where: {
      resetToken: resetToken,
    },
  });
}

export async function comparePasswords(plainPassword: string, hashedPassword: string) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

export async function updateResetToken(adminId: string, resetToken: string) {
  await prisma.admin.update({
    where: { id: adminId },
    data: { resetToken },
  });
}

export async function updateOtp(adminId: string, otp: string) {
  await prisma.admin.update({
    where: { id: adminId },
    data: { otp },
  });
}

export async function findAdminById(adminId: string) {
  return prisma.admin.findUnique({ where: { id: adminId } });
}

export async function updatePassword(adminId: string, newPasswordHash: string) {
  return prisma.admin.update({
    where: { id: adminId },
    data: { password: newPasswordHash },
  });
}

export async function clearResetToken(adminId: string): Promise<void> {
  await prisma.admin.update({
    where: { id: adminId },
    data: { resetToken: null }
  });
}

export async function clearOtp(adminId: string): Promise<void> {
  await prisma.admin.update({
    where: { id: adminId },
    data: { otp: null }
  });
}