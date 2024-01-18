import { Request, Response } from 'express';
import { recentWeeklyUsers } from '../../services/user.service';


export async function getTotalSubscribers(req: Request, res: Response) {
  try {
    const totalSubscribers = await recentWeeklyUsers();
    return res.status(200).json({
      status: "success",
      totalSubscribers,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Internal Server Error',
    });
  }
}