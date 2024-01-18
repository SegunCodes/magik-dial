import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth.utils';


export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(400).json({ message: 'Unauthorized' });
  }

  try {
    const { adminId } = verifyToken(token);
    if (!adminId) {
      return res.status(400).json({ message: 'Unauthorized' });
    }
  req.adminId = adminId;
    next();
  } catch (error) {
    return res.status(400).json({ message: 'Unauthorized' });
  }
};
