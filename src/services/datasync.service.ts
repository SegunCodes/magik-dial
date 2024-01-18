import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

import { UpdateTypeEnum } from '../helpers/enums';
import { DailyDatasync, Datasync } from '../helpers/interface';

interface PaginatedRecords<T> {
  records: T[];
  totalRecords: number;
  currentPage: number;
  pageSize: number;
  nextPage?: number;
}

export async function findMainDatasyncRecords(
  page: number,
  pageSize: number,
  userId: string | undefined,
  updateType: string | undefined,
  productId: string | undefined,
  serviceId: string | undefined
): Promise<PaginatedRecords<Datasync>> {
  const filters: any = {};
  if (userId) filters.msisdn = userId.toString();
  if (updateType) filters.updateType = updateType.toString();
  if (productId) filters.productId = productId.toString();
  if (serviceId) filters.serviceId = serviceId.toString();

  const totalRecords = await prisma.datasync.count({ where: filters });

  const records = await prisma.datasync.findMany({
    where: filters,
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const sanitizedRecords: Datasync[] = records.map((record: Datasync) => ({
    ...record,
  }));
  
  return {
    records: sanitizedRecords,
    totalRecords,
    currentPage: page,
    pageSize,
    nextPage: sanitizedRecords.length === pageSize ? page + 1 : undefined,
  };
}

export async function findDailyDatasyncRecords(
  page: number,
  pageSize: number,
  dateRange: string | undefined,
  userId: string | undefined,
  updateType: string | undefined,
  productId: string | undefined,
  serviceId: string | undefined
): Promise<PaginatedRecords<DailyDatasync>> {
  const filters: any = {};
  if (dateRange) {
    // Apply date range filter based on date format
    // filters.createdAt = { gte: startDate, lte: endDate };
  }
  if (userId) filters.msisdn = userId.toString();
  if (updateType) filters.updateType = updateType.toString();
  if (productId) filters.productId = productId.toString();
  if (serviceId) filters.serviceId = serviceId.toString();

  const totalRecords = await prisma.dailyDatasync.count({ where: filters });

  const records = await prisma.dailyDatasync.findMany({
    where: filters, 
    include: {
      product: true,
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  // Ensure that the updateType values are of type UpdateTypeEnum
  const sanitizedRecords: DailyDatasync[] = records.map((record: DailyDatasync) => ({
    ...record,
  }));

  return {
    records: sanitizedRecords,
    totalRecords,
    currentPage: page,
    pageSize,
    nextPage: sanitizedRecords.length === pageSize ? page + 1 : undefined,
  };
}

//=======================fetech total of active games=========================================
export async function totalActiveGames() {
  return await prisma.datasync.count({
    where: {
      updateType: {
        in: ["SUBSCRIBED", "RENEWED", "ONESHOT"],
      },
      createdAt: {
        gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    },
  });
}


export async function upsertDatasyncRecord(
  userId: string,
  serviceId: string,
  productId: string,
  updateType: UpdateTypeEnum,
  expiryTime: string
): Promise<void> {
  try {
    // Find the Datasync record for the user, service, and product
    const datasyncRecord = await prisma.datasync.findFirst({
      where: {
        msisdn: userId,
      },
    });

    if (datasyncRecord) {
      // If the record exists, update it
      await prisma.datasync.update({
        where: {
          id: datasyncRecord.id,
        },
        data: {
          subscribed: updateType === UpdateTypeEnum.SUBSCRIBED,
          updateType,
          serviceId,
          productId
        },
      });
    } else {
      // If the record doesn't exist, create it
      await prisma.datasync.create({
        data: {
          msisdn: userId,
          serviceId,
          productId,
          subscribed: updateType === UpdateTypeEnum.SUBSCRIBED,
          updateType,
          subExpiryTime: expiryTime,
        },
      });
    }
  } catch (error) {
    console.error('Error upserting Datasync record:', error);
    throw error;
  }
}

export async function createDailyDatasyncRecord(
  userId: string,
  productId: string,
  updateType: UpdateTypeEnum
): Promise<void> {
  try {
    await prisma.dailyDatasync.create({
      data: {
        msisdn: userId,
        productId,
        updateType,
      },
    });
  } catch (error) {
    throw new Error(`Error creating daily Datasync record: ${error}`);
  }
}

export async function findSubscribedDataById(msisdn: string) {
  return prisma.datasync.findMany({ where: { msisdn: msisdn, subscribed: true } });
}

export async function unsubscribeUser(msisdn: string): Promise<void> {
  await prisma.datasync.updateMany({
    where: {
      msisdn: msisdn,
      subscribed: true,
    },
    data: {
      subscribed: false,
    },
  });
}