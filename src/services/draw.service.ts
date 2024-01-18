import { PrismaClient } from '@prisma/client';
import { DrawConfig, DrawResult, DrawResultFilter } from '../helpers/interface';
const prisma = new PrismaClient();
import { DrawConfigType } from '../helpers/enums';

interface PaginatedRecords<T> {
  records: T[];
  totalRecords: number;
  currentPage: number;
  pageSize: number;
  nextPage?: number;
}

export async function getProductAmount(productId: string): Promise<number | null> {
    try {
      const product = await prisma.product.findUnique({
        where: {
          id: productId,
        },
      });
  
      if (product) {
        return product.amount;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error while fetching product amount: ', error);
      throw error;
    }
}

export const getActiveDrawConfig = async (productId: string) => {
    try {
        const activeDrawConfig = await prisma.drawConfig.findFirst({
            where: {
                productId: productId,
                isEnabled: true,
            },
        });

        if (activeDrawConfig) {
            return activeDrawConfig;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error in getActiveDrawConfig:', error);
        throw error;
    }
};

export async function getUsersFromDrawPool(productId: string): Promise<string[]> {
    try {
      const drawPoolEntry = await prisma.drawPool.findFirst({
        where: {
          productId,
        },
      });
  
      if (!drawPoolEntry) {
        return [];
      }
  
      // Extract and split the msisdns (user IDs)
      const userIDs: string[] = (drawPoolEntry.msisdns as string).split(',');
  
      // Filter out any empty strings or duplicates
      const uniqueUserIDs = [...new Set(userIDs.filter((id) => id.trim() !== ''))];
  
      return uniqueUserIDs;
    } catch (error) {
      console.error('Failed to retrieve user IDs from DrawPool: ', error);
      throw error;
    }
}
  

export async function createDrawResult(
  drawConfigId: string,
  winningUserIDs: string[],  // An array of winning user IDs
  winnablePercentage: number, 
  winnableAmount: number,
  winnersPerPool: BigInt,
  totalPoolSize: BigInt
) {
  try {
      const winners = winningUserIDs.join(','); // Combine the winners into a comma-separated string
      const winnersPerPoolNumber = Number(winnersPerPool);
      const totalPoolSizeNumber = Number(totalPoolSize);

      // Create a new DrawResult entry in the database
      const drawResult = await prisma.drawResult.create({
          data: {
              drawConfigId,
              winners,
              winnablePercentage: winnablePercentage,
              winnableAmount: winnableAmount,
              winnersPerPool: winnersPerPoolNumber,
              totalPoolSize: totalPoolSizeNumber,
              totalAmount: 100, // value will still be changed
          },
      });

      return drawResult;
  } catch (error) {
      console.error('Failed to create DrawResult: ', error);
      throw error;
  }
}

export function selectRandomWinners(userIDs: string[], numberOfWinners: number): string[] {
  if (numberOfWinners >= userIDs.length) {
      // If the number of winners requested is greater than or equal to the number of participants, return all participants as winners.
      return userIDs;
  } else {
      const shuffledUserIDs = [...userIDs];
      for (let i = shuffledUserIDs.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledUserIDs[i], shuffledUserIDs[j]] = [shuffledUserIDs[j], shuffledUserIDs[i]];
      }
      return shuffledUserIDs.slice(0, numberOfWinners);
  }
}

export async function createWinner(
  msisdn: string,
  productId: string,
  drawId: string,
  amountWon: number
) {
  try {
    const winner = await prisma.winner.create({
      data: {
        msisdn,
        productId,
        drawId,
        amountWon,
      },
    });

    return winner;
  } catch (error) {
    console.error('Failed to create Winner: ', error);
    throw error;
  }
}

export async function getDrawHistory(
  filter: DrawResultFilter,
  pageNumber: number,
  pageSize: number
): Promise<PaginatedRecords<DrawResult>> {
  try {
    const totalRecords = await prisma.drawResult.count({ where: filter });

    const history = await prisma.drawResult.findMany({
      where: filter,
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
    });

    return {
      records: history,
      totalRecords,
      currentPage: pageNumber,
      pageSize,
      nextPage: totalRecords > pageNumber * pageSize ? pageNumber + 1 : undefined,
    };
  } catch (error) {
    console.error('Failed to fetch draw history: ', error);
    throw error;
  }
}

export async function scheduleDrawsDb(
  productId: string,
  timePeriod: string,
  numberOfWinners: number
) {
  try {
    const schedule = await prisma.scheduledDraws.create({
        data: {
            productId,
            timePeriod,
            numberOfWinners,
            isPerformed: false,
        },
    });

    return schedule;
  } catch (error) {
    console.error('Failed to schedule draw: ', error);
    throw error;
  }
}

export async function checkForScheduledDraws(){
  const scheduledDraws = prisma.scheduledDraws.findMany({
    where: {
      isPerformed: false,
      timePeriod: {
        lte: new Date(), // Filter by draws whose time has passed
      },
    },
  });

  return scheduledDraws
}

export async function updateScheduledDraws(id: string){
  await prisma.scheduledDraws.update({
    where: { id: id },
    data: { isPerformed: true },
  });
}

export async function fetchSingleDrawFromDatabase(drawId: string) {
  try {
    const singleDraw = await prisma.drawResult.findFirst({
      where: {
        id: drawId, // This assumes that the draw has a unique ID
      },
    });

    return singleDraw;
  } catch (error) {
    console.error('Failed to fetch single draw from the database:', error);
    throw error;
  }
}

export async function fetchWinnersFromDatabase(drawResultId: string) {
  try {
    const winners = await prisma.winner.findMany({
      where: {
        drawId: drawResultId, // Filter winners by the draw result ID
      },
    });

    return winners;
  } catch (error) {
    console.error('Failed to fetch winners from the database:', error);
    throw error;
  }
}

export async function createDrawConfiguration(
  productId: string, 
  type: DrawConfigType, 
  shouldRunAutomatically: boolean, 
  shouldRunAutomaticallyUntilDate: string | null, 
  isEnabled: boolean,
  winnablePercentage: number,
  winnersPerPool: bigint,
  totalPoolSize: bigint
  ){
  try {
    const drawConfig = await prisma.drawConfig.create({
      data: {
        productId,
        type,
        shouldRunAutomatically,
        shouldRunAutomaticallyUntilDate,
        isEnabled,
        winnablePercentage,
        winnersPerPool,
        totalPoolSize,
      },
    });

    // Convert BigInt values to strings
    const drawConfigWithString = {
      ...drawConfig,
      winnersPerPool: drawConfig.winnersPerPool.toString(),
      totalPoolSize: drawConfig.totalPoolSize.toString(),
    };

    return drawConfigWithString;
  } catch (error) {
    console.error('Failed to create draw configuration:', error);
    throw error;
  }
}

export const getDrawConfigurations = async (
  page: number,
  pageSize: number
): Promise<PaginatedRecords<DrawConfig>> => {
  try {
    const drawConfigs = await prisma.drawConfig.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const totalRecords = await prisma.drawConfig.count(); // Get the total count of records

    const drawConfigsWithNumbers = drawConfigs.map((config: DrawConfig) => ({
      ...config,
      winnersPerPool: Number(config.winnersPerPool), // Convert to number
      totalPoolSize: Number(config.totalPoolSize),
    }));

    return {
      records: drawConfigsWithNumbers,
      totalRecords,
      currentPage: page,
      pageSize,
      nextPage: totalRecords > page * pageSize ? page + 1 : undefined,
    };
  } catch (error) {
    console.error('Failed to fetch draw configurations:', error);
    throw error;
  }
};


export async function getSingleDrawConfiguration(drawConfigId: string) {
  try {
    const drawConfig = await prisma.drawConfig.findUnique({
      where: {
        id: drawConfigId,
      },
    });

    if (drawConfig) {
      // Convert BigInt values to strings
      const drawConfigWithStrings = {
        ...drawConfig,
        winnersPerPool: drawConfig.winnersPerPool.toString(),
        totalPoolSize: drawConfig.totalPoolSize.toString(),
      };

      return drawConfigWithStrings;
    } else {
      return null; // or handle the case where the draw configuration is not found
    }
  } catch (error) {
    console.error('Failed to fetch single draw configuration:', error);
    throw error;
  }
}

export async function deleteDrawConfiguration(drawConfigId: string) {
  try {
    await prisma.drawConfig.delete({
      where: {
        id: drawConfigId,
      },
    });
  } catch (error) {
    console.error('Failed to delete draw configuration:', error);
    throw error;
  }
}

export async function updateDrawConfiguration(
  drawConfigId: string,
  type: DrawConfigType,
  shouldRunAutomatically: boolean,
  shouldRunAutomaticallyUntilDate: string | null,
  isEnabled: boolean,
  winnablePercentage: number,
  winnersPerPool: number,
  totalPoolSize: number
) {
  return prisma.drawConfig.update({
    where: {
      id: drawConfigId,
    },
    data: {
      type,
      shouldRunAutomatically,
      shouldRunAutomaticallyUntilDate,
      isEnabled,
      winnablePercentage,
      winnersPerPool: { set: BigInt(winnersPerPool) },
      totalPoolSize: { set: BigInt(totalPoolSize) },
    },
  });
}

export async function updatePartnerEarnings(totalMoneyForProduct: number, winnablePercentage: number, drawResultId: string) {
  try {
    // Calculate the revenue share for partners
    const revenueShare = (totalMoneyForProduct * (100 - winnablePercentage)) / 100;

    // Fetch partners who should receive revenue
    const partners = await prisma.partner.findMany({
      where: {
        shouldReceiveRevenue: true,
      },
    });

    // Calculate and update earnings for each partner
    for (const partner of partners) {
      const earnings = (revenueShare * partner.revenueSharePercentage) / 100;

      // Create PartnerEarning entry
      await prisma.partnerEarning.create({
        data: {
          partnerId: partner.id,
          drawResultId,
          amount: earnings,
          earningPercentage: partner.revenueSharePercentage
        },
      });

      // Update the partner's current balance
      await prisma.partner.update({
        where: { id: partner.id },
        data: {
          currentBalance: partner.currentBalance + earnings,
        },
      });
    }
  } catch (error) {
    console.error('Failed to update partner earnings:', error);
    throw error;
  }
}