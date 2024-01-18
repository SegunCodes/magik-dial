// totalRevenueService.ts

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function calculateTotalRevenue(
  startDate: Date,
  endDate: Date
): Promise<{ totalDailyRevenue: number; totalMonthlyRevenue: number }> {
  // Find DailyDatasync records with the specified filters
  const dailyDatasyncRecords = await prisma.dailyDatasync.findMany({
    where: {
      updateType: {
        in: ["SUBSCRIBED", "RENEWED", "ONESHOT"],
      },
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      createdAt: true,
      product: {
        select: {
          amount: true,
        },
      },
    },
  });

  if (dailyDatasyncRecords.length === 0) {
    return {
      totalDailyRevenue: 0,
      totalMonthlyRevenue: 0,
    };
  }

  let totalDailyRevenue = 0;
  let totalMonthlyRevenue = 0;

  dailyDatasyncRecords.forEach((record: any) => {
    // Check if product is not null before accessing amount
    if (record.product !== null) {
      const dailyAmount = record.product.amount;
      const createdAt = new Date(record.createdAt);

      // Calculate daily revenue
      totalDailyRevenue += dailyAmount;

      // Check if the record is within the current month
      const isWithinCurrentMonth =
        createdAt >= startDate && createdAt <= endDate;

      if (isWithinCurrentMonth) {
        // Calculate monthly revenue
        totalMonthlyRevenue += dailyAmount;
      }
    }
  });

  return {
    totalDailyRevenue,
    totalMonthlyRevenue,
  };
}

// display the monthly revenue
export async function monthlyRevenueTimeseries(startDate: Date, endDate: Date, updateTypes?: string[]): Promise<any[]> {
  const monthlyRevenues: any[] = [];

  while (startDate <= endDate) {
    const firstDayOfMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const lastDayOfMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

    const dailyDatasyncRecords = await prisma.dailyDatasync.findMany({
      where: {
        updateType: {
          in: updateTypes ? ['SUBSCRIBED', 'RENEWED', 'ONESHOT'] : undefined,
        },
        createdAt: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
      select: {
        createdAt: true,
        product: {
          select: {
            amount: true,
          },
        },
      },
    });

    const monthlyData = {
      month: `${new Intl.DateTimeFormat('en-US', { month: 'long' }).format(startDate)} ${startDate.getFullYear()}`,
      amount: 0,
    };

    dailyDatasyncRecords.forEach((record: any) => {
      if (record.product !== null) {
        const dailyAmount = record.product.amount;
        monthlyData.amount += dailyAmount;
      }
    });

    monthlyRevenues.push(monthlyData);

    startDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);
  }

  return monthlyRevenues;
}




//display daily reveune
export async function dailyRevenueTimeseries(startDate: Date, endDate: Date, updateTypes?: string[]): Promise<any[]> {
  const dailyRevenues: any[] = [];

  while (startDate <= endDate) {
    const dailyDatasyncRecords = await prisma.dailyDatasync.findMany({
      where: {
        updateType: {
          in: updateTypes ? ['SUBSCRIBED', 'RENEWED', 'ONESHOT'] : undefined,
        },
        createdAt: {
          gte: startDate,
          lte: startDate,
        },
      },
      select: {
        createdAt: true,
        product: {
          select: {
            amount: true,
          },
        },
      },
    });

    let totalDailyRevenue = 0;

    dailyDatasyncRecords.forEach((record: any) => {
      if (record.product !== null) {
        const dailyAmount = record.product.amount;
        totalDailyRevenue += dailyAmount;
      }
    });

    dailyRevenues.push({
      date: startDate.toISOString().split('T')[0],
      amount: totalDailyRevenue,
    });

    startDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 1);
  }

  return dailyRevenues;
}