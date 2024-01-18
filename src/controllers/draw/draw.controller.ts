import { Request, Response } from 'express';
import { 
    getActiveDrawConfig, 
    getUsersFromDrawPool, 
    createDrawResult, 
    getProductAmount, 
    createWinner, 
    scheduleDrawsDb, 
    selectRandomWinners,
    getDrawHistory, 
    fetchSingleDrawFromDatabase,
    fetchWinnersFromDatabase,
    checkForScheduledDraws,
    updateScheduledDraws,
    createDrawConfiguration,
    getDrawConfigurations,
    getSingleDrawConfiguration,
    deleteDrawConfiguration,
    updateDrawConfiguration,
    updatePartnerEarnings
} from '../../services/draw.service';
import { DrawConfigType } from '../../helpers/enums';
import { updateUserBalance } from '../../services/user.service';
import { DrawResult, Winner } from '../../helpers/interface';
export interface PaginatedRecords<T> {
  records: T[];
  totalRecords: number;
  currentPage: number;
  pageSize: number;
  nextPage?: number | null;
}

export async function executeDrawLogic(productId: string, numberOfWinners: number) {
  // Ensure the number of winners is valid
  if (numberOfWinners <= 0) {
    return { status: 'error', message: 'Invalid number of winners.' };
  }

  const productAmount = await getProductAmount(productId);
  if (!productAmount) {
    return { status: 'error', message: 'Product not found' };
  }

  const drawConfig = await getActiveDrawConfig(productId);

  if (!drawConfig) {
    return { status: 'error', message: 'No active draw configuration found for this product.' };
  }

  // Fetch the list of user IDs from the DrawPool
  const userIDs = await getUsersFromDrawPool(productId);

  if (userIDs.length === 0) {
    return { status: 'error', message: 'No participants available for the draw.' };
  }

  // Calculate the total money for the product
  const totalMoneyForProduct = userIDs.length * productAmount;

  // Calculate the total shareable amount for each user
  const totalShareableAmount = (totalMoneyForProduct * drawConfig.winnablePercentage) / 100;

  // Calculate the amount won for each winner
  const amountPerWinner = totalShareableAmount / numberOfWinners;

  const selectedWinners = selectRandomWinners(userIDs, numberOfWinners);

  // Create a DrawResult entry for all winners
  const drawResult = await createDrawResult(
    drawConfig.id,
    selectedWinners,
    drawConfig.winnablePercentage,
    amountPerWinner,
    drawConfig.winnersPerPool,
    drawConfig.totalPoolSize
  );

  // Create Winner records for each winner
  const winners = [];
  for (const winningUserID of selectedWinners) {
    const winner = await createWinner(winningUserID, productId, drawResult.id, amountPerWinner);
    winners.push(winner);

    // Update the balance of each winner in the user model
    await updateUserBalance(winningUserID, amountPerWinner);
  }

  // Calculate revenue share for partners and update the PartnerEarning table
  await updatePartnerEarnings(totalMoneyForProduct, drawConfig.winnablePercentage, drawResult.id);
  return { status: 'success', message: 'Winners selected:', winners };
}

export const performInstantDraw = async (req: Request, res: Response) => {
  try {
    const productId = req.params.productId;
    const numberOfWinners = req.body.numberOfWinners;

    const drawResult = await executeDrawLogic(productId, numberOfWinners);

    if (drawResult.status === 'error') {
      res.status(400).json({ message: drawResult.message });
    } else {
      res.status(200).json({ message : drawResult });
    }
  } catch (error) {
    console.error('perform instant draw error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const scheduleDraw = async (req: Request, res: Response) => {
    try {
        const { productId, timePeriods, numberOfWinners } = req.body;

        // Ensure the number of winners is valid
        if (numberOfWinners <= 0) {
            return res.status(400).json({ message: 'Invalid number of winners.' });
        }
        // ['2023-01-01 23:59:00', '2023-01-04 06:00:00'] is expected timePeriods format

        //check if product id is valid
        const productExists = await getProductAmount(productId);
        if (!productExists) {
            return res.status(400).json({ message: 'Product not found' });
        }

        // get product draw configuration
        const drawConfig = await getActiveDrawConfig(productId);

        if (!drawConfig) {
            return res.status(400).json({ message: 'No active draw configuration found for this product.' });
        }

        //Check if the draw should run automatically
        if (!drawConfig.shouldRunAutomatically) {
            return res.status(400).json({ message: 'Draw cannot be performed automatically for this product' });
        }

        // Convert timePeriods to an array of Date objects
        const timePeriodDates = timePeriods.map((dateTimeString: string) => new Date(dateTimeString));

        // Create a record for each time period and store them in the database
        for (const timePeriod of timePeriodDates) {
            await scheduleDrawsDb(productId, timePeriod, numberOfWinners)
        }
    
        // Return a success response
      res.status(200).json({ message: 'Draws scheduled successfully' });
    } catch (error) {
      console.error('schedule draw error:', error);
      res.status(500).json({ message: 'Server error' });
    }
};

export const drawHistory = async (req: Request, res: Response) => {
  try {
    // Extract query parameters for filtering and pagination
    const { productType, fromDate, toDate, page, pageSize } = req.query;

    // Convert page and pageSize to numbers (use default values if not provided)
    const pageNumber = page ? parseInt(page as string) : 1;
    const limit = pageSize ? parseInt(pageSize as string) : 10;

    if (isNaN(pageNumber) || isNaN(limit) || pageNumber < 1 || limit < 1) {
      return res.status(400).json({ message: 'Invalid page or pageSize parameters' });
    }

    // filter object based on query parameters
    const filter = {
      // Filter by product type if provided
      // ...(productType && { drawConfig: { type: productType } }),
      // Filter by date range if both fromDate and toDate are provided
      ...(fromDate &&
        toDate && {
          createdAt: {
            gte: new Date(fromDate as string),
            lte: new Date(toDate as string),
          },
        }),
    };

    const drawHistory = await getDrawHistory(filter, pageNumber, limit);

    // Convert BigInt values to strings
    const result = drawHistory.records.map((draw: DrawResult) => ({
      ...draw,
      winnersPerPool: draw.winnersPerPool.toString(),
      totalPoolSize: draw.totalPoolSize.toString(),
    }));

    // Return the draw history and pagination info as a JSON response
    res.status(200).json({
      result,
      pagination: {
        totalRecords: drawHistory.totalRecords,
        currentPage: drawHistory.currentPage,
        pageSize: drawHistory.pageSize,
        nextPage: drawHistory.nextPage,
      },
    });
  } catch (error) {
    console.error('draw history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const fetchSingleDraw = async (req: Request, res: Response) => {
    try {
      const drawId = req.params.drawId;
  
      // Use the drawId to fetch the single draw
      const singleDraw = await fetchSingleDrawFromDatabase(drawId);
  
      if (!singleDraw) {
        return res.status(400).json({ message: 'Draw not found' });
      }

      const result = {
        ...singleDraw,
        winnersPerPool: singleDraw.winnersPerPool.toString(),
        totalPoolSize: singleDraw.totalPoolSize.toString(),
      };
  
      res.status(200).json({ result });
    } catch (error) {
      console.error('fetch single draw error:', error);
      res.status(500).json({ message: 'Server error' });
    }
};
  
export const fetchWinnersForDraw = async (req: Request, res: Response) => {
  try {
    const drawId = req.params.drawId;
    const page = parseInt(req.query.page as string, 10) || 1; // Default to page 1
    const pageSize = parseInt(req.query.pageSize as string, 10) || 10; // Default to 10 items per page

    const offset = (page - 1) * pageSize;

    const winners = await fetchWinnersFromDatabase(drawId);
    const totalRecords = winners.length;

    // Paginate the winners
    const paginatedWinners = winners.slice(offset, offset + pageSize);

    if (!paginatedWinners || paginatedWinners.length === 0) {
      return res.status(400).json({ message: 'No winners found for this draw' });
    }

    const paginationInfo: PaginatedRecords<Winner> = {
      records: paginatedWinners,
      totalRecords,
      currentPage: page,
      pageSize,
      nextPage: totalRecords > offset + pageSize ? page + 1 : null,
    };

    // Return the winners and pagination info as a JSON response
    res.status(200).json({ result: paginationInfo });
  } catch (error) {
    console.error('fetch winners for draw error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createDrawConfig = async (req: Request, res: Response) => {
  try {
    const { productId, type, shouldRunAutomatically, shouldRunAutomaticallyUntilDate, isEnabled, winnablePercentage, winnersPerPool, totalPoolSize } = req.body;

    if (!Object.values(DrawConfigType).includes(type)) {
      return res.status(400).json({ message: 'Invalid type' });
    }

    const isoDate = shouldRunAutomaticallyUntilDate
      ? new Date(shouldRunAutomaticallyUntilDate).toISOString()
      : null;
    
    const drawConfig = await createDrawConfiguration(productId, type, shouldRunAutomatically, isoDate, isEnabled, winnablePercentage, winnersPerPool, totalPoolSize)

    res.status(200).json(drawConfig);
  } catch (error) {
    console.error('Create DrawConfig error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getDrawConfigs = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1; // Default to page 1
    const pageSize = parseInt(req.query.pageSize as string, 10) || 10; // Default to 10 items per page

    const drawConfigs = await getDrawConfigurations(page, pageSize);

    if (!drawConfigs.records || drawConfigs.records.length === 0) {
      return res.status(400).json({ message: 'No draw configurations found' });
    }

    res.status(200).json(drawConfigs);
  } catch (error) {
    console.error('Failed to fetch DrawConfigs: ', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getDrawConfig = async (req: Request, res: Response) => {
  try {
    const drawConfigId = req.params.id;
    const drawConfig = await getSingleDrawConfiguration(drawConfigId)

    if (!drawConfig) {
      return res.status(400).json({ message: 'DrawConfig not found' });
    }

    res.status(200).json(drawConfig);
  } catch (error) {
    console.error('Get DrawConfig error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateDrawConfig = async (req: Request, res: Response) => {
  try {
    const drawConfigId = req.params.id;
    // check if id exists
    const drawConfig = await getSingleDrawConfiguration(drawConfigId)

    if (!drawConfig) {
      return res.status(400).json({ message: 'DrawConfig not found' });
    }
    
    const { type, shouldRunAutomatically, shouldRunAutomaticallyUntilDate, isEnabled, winnablePercentage, winnersPerPool, totalPoolSize } = req.body;

    const isoDate = shouldRunAutomaticallyUntilDate
    ? new Date(shouldRunAutomaticallyUntilDate).toISOString()
    : null;

    const updatedDrawConfig = await updateDrawConfiguration(
      drawConfigId,
      type,
      shouldRunAutomatically,
      isoDate,
      isEnabled,
      winnablePercentage,
      winnersPerPool,
      totalPoolSize
    );

    const updatedDrawConfigWithStrings = {
      ...updatedDrawConfig,
      winnersPerPool: updatedDrawConfig.winnersPerPool.toString(),
      totalPoolSize: updatedDrawConfig.totalPoolSize.toString(),
    };

    res.status(200).json(updatedDrawConfigWithStrings);
  } catch (error) {
    console.error('Update DrawConfig error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteDrawConfig = async (req: Request, res: Response) => {
  try {
    const drawConfigId = req.params.id;

    await deleteDrawConfiguration(drawConfigId)

    res.status(200).send();
  } catch (error) {
    console.error('Delete DrawConfig error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
