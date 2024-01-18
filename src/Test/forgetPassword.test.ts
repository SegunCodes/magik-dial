// In forgetPassword.test.ts
import { Request, Response } from 'express';
import { forgotPassword,generateRandomToken } from '../controllers/auth/auth.controller';
import { findAdminByEmail, updateResetToken } from '../services/auth.service';
import * as mailerModule from '../helpers/mailer'; // Import the entire module
import transporter from '../config/nodemailer.config';

jest.mock('../services/auth.service');
jest.mock('../helpers/mailer');
jest.mock('nodemailer');

describe('forgotPassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully send a password reset email', async () => {
    (findAdminByEmail as jest.Mock).mockResolvedValueOnce({
      email: 'admin@example.com',
    });

    // Mock the random token
    jest.spyOn(require('crypto'), 'randomBytes').mockReturnValue(Buffer.from('mocked-reset-token'));

    // Mock the transporter behavior
    (mailerModule.sendEmail as jest.Mock).mockResolvedValueOnce({/* mocked response */});

    const req: Partial<Request> = { body: { email: 'admin@example.com' } };
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await forgotPassword(req as Request, res as Response);

    // Add your assertions here
  });
});
