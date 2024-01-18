import { Request, Response } from 'express';
import { resetPassword } from '../controllers/auth/auth.controller';
import { hashPassword } from '../utils/auth.utils';
import { findAdminByResetToken, updatePassword, clearResetToken } from '../services/auth.service';

jest.mock('../utils/auth.utils', () => ({
  hashPassword: jest.fn(),
}));

jest.mock('../services/auth.service', () => ({
  findAdminByResetToken: jest.fn(),
  updatePassword: jest.fn(),
  clearResetToken: jest.fn(),
}));

describe('resetPassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should reset the password and clear reset token', async () => {
    // Mock the request and response objects
    const req: Partial<Request> = {
      body: { resetToken: 'valid-reset-token', newPassword: 'new-password' },
    };
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock the behavior of findAdminByResetToken
    (findAdminByResetToken as jest.Mock).mockResolvedValueOnce({ id: 'adminId' });

    // Mock the behavior of hashPassword
    (hashPassword as jest.Mock).mockResolvedValueOnce('hashed-password');

    await resetPassword(req as Request, res as Response);

    // Verify that the functions were called with the expected arguments
    expect(findAdminByResetToken).toHaveBeenCalledWith('valid-reset-token');
    expect(hashPassword).toHaveBeenCalledWith('new-password');
    expect(updatePassword).toHaveBeenCalledWith('adminId', 'hashed-password');
    expect(clearResetToken).toHaveBeenCalledWith('adminId');

    // Verify the response
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Password reset successful' });
  });

  it('should handle an invalid reset token', async () => {
    // Mock the request and response objects
    const req: Partial<Request> = {
      body: { resetToken: 'invalid-reset-token', newPassword: 'new-password' },
    };
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock the behavior of findAdminByResetToken
    (findAdminByResetToken as jest.Mock).mockResolvedValueOnce(null);

    await resetPassword(req as Request, res as Response);

    // Verify that the functions were called with the expected arguments
    expect(findAdminByResetToken).toHaveBeenCalledWith('invalid-reset-token');
    expect(hashPassword).not.toHaveBeenCalled();
    expect(updatePassword).not.toHaveBeenCalled();
    expect(clearResetToken).not.toHaveBeenCalled();

    // Verify the response
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid reset token' });
  });

});
