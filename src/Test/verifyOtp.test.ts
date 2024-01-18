import { Request, Response } from 'express';
import { verifyOtp } from '../controllers/auth/auth.controller';
import { findAdminByEmail, clearOtp  } from '../services/auth.service'; 
import { generateToken, compareOTP } from '../utils/auth.utils';
import { sendEmail } from '../helpers/mailer'; 

jest.mock('../helpers/mailer', () => ({
  sendEmail: jest.fn(),
}));

jest.mock('../services/auth.service', () => ({
  findAdminByEmail: jest.fn(),
  clearOtp: jest.fn(),
}));

jest.mock('../utils/auth.utils', () => ({
    compareOTP: jest.fn(),
    generateToken: jest.fn(),
}));
  

describe('verifyOtp', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully verify OTP and return a token', async () => {
    (findAdminByEmail as jest.Mock).mockResolvedValueOnce({
      id: 'adminId',
      email: 'admin@example.com',
      otp: '123456', 
    });

    (compareOTP as jest.Mock).mockReturnValueOnce(true);

    (generateToken as jest.Mock).mockReturnValueOnce('mocked-token');

    const req: Partial<Request> = { body: { email: 'admin@example.com', otp: '123456' } };
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await verifyOtp(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith({ token: 'mocked-token' });

    expect(clearOtp).toHaveBeenCalledWith('adminId');
  });

  it('should return an error for an invalid OTP', async () => {
    
    (findAdminByEmail as jest.Mock).mockResolvedValueOnce({
      id: 'adminId',
      email: 'admin@example.com',
      otp: '123456', 
    });

    (compareOTP as jest.Mock).mockReturnValueOnce(false);

    const req: Partial<Request> = { body: { email: 'admin@example.com', otp: '654321' } };
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await verifyOtp(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid OTP' });

    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('should return an error for admin not found', async () => {
    (findAdminByEmail as jest.Mock).mockResolvedValueOnce(null);

    const req: Partial<Request> = { body: { email: 'nonexistent@example.com', otp: '123456' } };
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await verifyOtp(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({ message: 'Admin not found' });

    expect(sendEmail).not.toHaveBeenCalled();
  });
});
