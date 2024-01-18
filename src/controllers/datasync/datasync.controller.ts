import { Request, Response } from "express";
import {
  findMainDatasyncRecords,
  findDailyDatasyncRecords,
  totalActiveGames
} from "../../services/datasync.service";

interface PaginationInfo {
  totalRecords: number;
  currentPage: number;
  pageSize: number;
  nextPage?: number | null;
  // Add more properties as needed
}

export const getDailyDatasyncRecords = async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      pageSize = '10',
      dateRange,
      userId,
      updateType,
      productId,
      serviceId,
    } = req.query;

    // Explicitly convert page and pageSize to numbers
    const pageNumber = parseInt(page as string, 10);
    const pageSizeNumber = parseInt(pageSize as string, 10);
    const offset = (pageNumber - 1) * pageSizeNumber;

    if (!Number.isInteger(pageNumber) || pageNumber < 1 || !Number.isInteger(pageSizeNumber) || pageSizeNumber < 1) {
      return res.status(400).json({ message: 'Invalid page or pageSize values' });
    }

    const { records: dailyDatasyncRecords, totalRecords } = await findDailyDatasyncRecords(
      pageNumber,
      pageSizeNumber,
      dateRange as string | undefined,
      userId as string | undefined,
      updateType as string | undefined,
      productId as string | undefined,
      serviceId as string | undefined
    );

    const nextPage =  totalRecords > offset + pageSizeNumber ? pageNumber + 1 : null
    const paginationInfo: PaginationInfo = {
      totalRecords,
      currentPage: pageNumber,
      pageSize: pageSizeNumber,
      nextPage: nextPage
    };

    // Calculate the nextPage if available
    if (totalRecords > pageNumber * pageSizeNumber) {
      paginationInfo.nextPage = pageNumber + 1;
    }

    res.status(200).json({ records: dailyDatasyncRecords, pagination: paginationInfo });
  } catch (error) {
    console.error('Fetch daily Datasync records error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMainDatasyncRecords = async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      pageSize = '10',
      userId,
      updateType,
      productId,
      serviceId,
    } = req.query;

    // Validate page and pageSize
    const pageNumber = parseInt(page as string, 10);
    const pageSizeNumber = parseInt(pageSize as string, 10);
    const offset = (pageNumber - 1) * pageSizeNumber;

    if (!Number.isInteger(pageNumber) || pageNumber < 1 || !Number.isInteger(pageSizeNumber) || pageSizeNumber < 1) {
      return res.status(400).json({ message: 'Invalid page or pageSize values' });
    }

    // Use Non-Null Assertion Operator (!) for type casting
    const { records: mainDatasyncRecords, totalRecords } = await findMainDatasyncRecords(
      pageNumber,
      pageSizeNumber,
      userId as string | undefined,
      updateType as string | undefined,
      productId as string | undefined,
      serviceId as string | undefined
    );
    const nextPage =  totalRecords > offset + pageSizeNumber ? pageNumber + 1 : null
    const paginationInfo: PaginationInfo = {
      totalRecords,
      currentPage: pageNumber,
      pageSize: pageSizeNumber,
      nextPage: nextPage
    };

    // Calculate the nextPage if available
    if (totalRecords > pageNumber * pageSizeNumber) {
      paginationInfo.nextPage = pageNumber + 1;
    }

    res.status(200).json({ records: mainDatasyncRecords, pagination: paginationInfo });
  } catch (error) {
    console.error('Fetch main Datasync records error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


//total active games query the datasync table
export async function getAllActiveGames(req: Request, res: Response){
  try {
    const datasyncStats = await totalActiveGames();
    res.status(200).json({
      status: "success",
      datasyncStats,
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

