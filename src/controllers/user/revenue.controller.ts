import { Request, Response } from 'express';
import { calculateTotalRevenue, monthlyRevenueTimeseries, dailyRevenueTimeseries } from '../../services/revenue.service';

// Controller for calculating total revenue
export async function getTotalRevenueController(req: Request, res: Response) {
  const startDate = new Date(req.query.startDate as string);
  const endDate = new Date(req.query.endDate as string);

  try {
    const { totalDailyRevenue, totalMonthlyRevenue } = await calculateTotalRevenue(startDate, endDate);

    res.status(200).json({
      totalDailyRevenue,
      totalMonthlyRevenue,
    });
  } catch (error) {
    console.error('Error calculating total revenue:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Controller for fetching monthly revenue time series data
export async function monthlyRevenueGraph(req: Request, res: Response) {
  try {
    const startDate = req.query.startDate as string; 
    const endDate = req.query.endDate as string;
    const updateTypes = req.query.updateTypes as string[]; 

    
    // Parse query parameters into Date objects
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    
    const monthlyRevenues = await monthlyRevenueTimeseries(parsedStartDate, parsedEndDate, updateTypes);

    res.json({ monthlyRevenues });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}


export async function dailyRevenueGraph(req: Request, res: Response) {
  try {
    const startDate = req.query.startDate as string; 
    const endDate = req.query.endDate as string;
    const updateTypes = req.query.updateTypes as string[]; 

    
    // Parse query parameters into Date objects
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    
    const dailyRevenues = await dailyRevenueTimeseries(parsedStartDate, parsedEndDate, updateTypes);

    res.status(200).json({ dailyRevenues });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}