import { Request, Response } from 'express';
import { findById, getUsersWithPagination } from '../../services/user.service';


export const getSingleUser = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      const user = await findById(userId)
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json(user);
    } catch (error) {
      console.error('Fetch single user error:', error);
      res.status(500).json({ message: 'Server error' });
    }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
      const { page = '1', pageSize = '10' } = req.query;

      const pageNumber = parseInt(page as string, 10);
      const pageSizeNumber = parseInt(pageSize as string, 10);

      if (!Number.isInteger(pageNumber) || pageNumber < 1 || !Number.isInteger(pageSizeNumber) || pageSizeNumber < 1) {
        return res.status(400).json({ message: 'Invalid page or pageSize values' });
      }

      const { users, totalRecords } = await getUsersWithPagination(pageNumber, pageSizeNumber);

      const totalPages = Math.ceil(totalRecords / pageSizeNumber);
      const nextPage = pageNumber < totalPages ? pageNumber + 1 : null;
      const paginationInfo = {
          totalRecords,
          currentPage: pageNumber,
          pageSize: pageSizeNumber,
          totalPages,
          nextPage,
      };

      res.status(200).json({ users, pagination: paginationInfo });
  } catch (error) {
      console.error('Fetch all users error:', error);
      res.status(500).json({ message: 'Server error' });
  }
};
