import { PrismaClient } from '@prisma/client';
import { User } from '../helpers/interface';
const prisma = new PrismaClient();

export async function createUser(msisdn: string) {
  return prisma.user.create({
    data: {
      msisdn: msisdn,
      isBanned: false,
      status: 'active'
    },
  });
}

// find user by id
export async function findById(userId: string) {
    return prisma.user.findUnique({ where: { msisdn: userId } });
}

export async function getUsersWithPagination(page: number, pageSize: number): Promise<{ users: User[], totalRecords: number }> {
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const users = await prisma.user.findMany({
      skip,
      take,
  });

  const totalRecords = await prisma.user.count();

  return { users, totalRecords };
}

export async function updateUserBankDetails(msisdn: string, bankAccountNumber: string, bankName: string, accountName: string) {
  // Perform a manual update
  await prisma.user.update({
    where: { msisdn: msisdn },
    data: {
      bankAccountNumber: BigInt(bankAccountNumber).toString(),
      bankName: bankName,
      bankAccountName: accountName,
    },
  });
}

//total users created in the last 7days 
export async function recentWeeklyUsers(){
  return await prisma.user.count({
    where: {
       createdAt: {
        gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    }
  }
 })
}

export async function updateUserBalance(userID: string, amount: number) {
  try {
    await prisma.user.update({
      where: { msisdn: userID },
      data: {
        balance: {
          increment: amount,
        },
      },
    });
  } catch (error) {
    console.error('Failed to update user balance:', error);
    throw error;
  }
}