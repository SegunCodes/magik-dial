import { Request, Response } from 'express';
import { adminLogin } from '../controllers/auth/auth.controller';
import { findAdminByEmail, comparePasswords, updateOtp } from '../services/auth.service';
import { generateSixDigitOTP } from '../utils/auth.utils';
import { sendEmail } from '../helpers/mailer'; 

jest.mock('../helpers/mailer', () => ({
  sendEmail: jest.fn(),
}));

jest.mock('../services/auth.service', () => ({
  findAdminByEmail: jest.fn(),
  comparePasswords: jest.fn(),
  updateOtp: jest.fn(),
}));

jest.mock('../utils/auth.utils', () => ({
  generateSixDigitOTP: jest.fn(),
}));

describe('adminLogin', () => {
  beforeEach(() => {
    jest.clearAllMocks(); 
  });

  it('should successfully log in an admin', async () => {
    (findAdminByEmail as jest.Mock).mockResolvedValueOnce({
      id: '456cd658-cd83-4f98-868e-17927a7bf9c5',
      email: 'admin@example.com',
      password: '$2b$10$Z9SAFmsjCuWKa66mAZoM6eKCTzCOgdtf6IBoSFCMM8BLL78RnKqH6',
    });
    (comparePasswords as jest.Mock).mockResolvedValueOnce(true);
    (updateOtp as jest.Mock).mockResolvedValueOnce({});

    (generateSixDigitOTP as jest.Mock).mockReturnValueOnce('123456');

    const req: Partial<Request> = { body: { email: 'admin@example.com', password: 'password' } };
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await adminLogin(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);

    expect(sendEmail).toHaveBeenCalledWith({
      from: expect.any(String),
      to: 'admin@example.com',
      subject: 'One-Time Password (OTP)',
      html: expect.stringContaining('Your OTP is: 123456'),
    });
  });

});
