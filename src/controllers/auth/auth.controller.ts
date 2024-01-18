import { Request, Response } from 'express';
import { generateToken, verifyToken, hashPassword, compareOTP, generateSixDigitOTP } from '../../utils/auth.utils';
import { findAdminByEmail, comparePasswords, updateResetToken, findAdminById, updatePassword, updateOtp, clearResetToken, clearOtp, findAdminByResetToken } from '../../services/auth.service';
import { sendEmail } from '../../helpers/mailer';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

const defaultFromEmail = 'buzzycash@admin.com'; 

export const generateRandomToken = (length: number): string => {
  const token = randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
  return token;
};

export const adminLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const admin = await findAdminByEmail(email);

    if (!admin) {
      return res.status(400).json({ message: 'Admin not found' });
    }

    const passwordMatch = await comparePasswords(password, admin.password || '');

    if (!passwordMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Generate a one-time password (OTP)
    const otpNumber = generateSixDigitOTP();
    const otp = otpNumber.toString();

    // Save the OTP in the admin table
    await updateOtp(admin.id, otp);

    console.log(otp)

    // Send the OTP to the admin via email
    const emailData = {
      from: process.env.EMAIL_ADDRESS || defaultFromEmail,
      to: admin.email,
      subject: 'One-Time Password (OTP)',
      html: `<p>Your OTP is: ${otp}</p>`,
    };

    await sendEmail(emailData);

    res.status(200).json({ email: email });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



export const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  try {
    const admin = await findAdminByEmail(email);

    if (!admin) {
      return res.status(400).json({ message: 'Admin not found' });
    }

    // If admin.otp is not null, compare the OTPs; otherwise, set otpMatch to false
    const otpMatch = admin.otp ? compareOTP(otp, admin.otp) : false;

    if (!otpMatch) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    const token = generateToken({ adminId: admin.id });

    // Clear the otp from the database
    await clearOtp(admin.id);

    res.status(200).json({ token: token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;
  
    try {
      // Find the admin in the database by email
      const admin = await findAdminByEmail(email);
  
      if (!admin) {
        return res.status(400).json({ message: 'Admin not found' });
      }

      const resetToken = generateRandomToken(75);

      // Update the admin's record with the reset token
      await updateResetToken(admin.id, resetToken);

      console.log(resetToken)
  
      // Send a password reset email to the user with a link containing the resetToken
      const resetLink = `https://example.com/reset-password?token=${resetToken}`;
      const emailData = {
        from: process.env.EMAIL_ADDRESS || defaultFromEmail,
        to: admin.email,
        subject: 'Password Reset',
        html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
      };

      await sendEmail(emailData);
  
      res.status(200).json({ message: 'Password reset email sent. Check your inbox.' });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ message: 'Server error' });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { resetToken, newPassword } = req.body;

  try {
    // Find the admin in the database by reset token
    const admin = await findAdminByResetToken(resetToken);

    if (!admin) {
      return res.status(400).json({ message: 'Invalid reset token' });
    }

    // Hash the new password before updating
    const hashedPassword = await hashPassword(newPassword);

    await updatePassword(admin.id, hashedPassword);

    // Clear the reset token from the database
    await clearResetToken(admin.id);

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {    
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const changePassword = async (req: Request, res: Response) => {

  const { oldPassword, newPassword } = req.body;

  try {
   const adminId = (req.adminId);
    if (!adminId) {
      return res.status(400).json({ message: 'Unauthorized' });
    }

    const admin = await findAdminById(adminId);

    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(oldPassword, admin.password);

    if (!passwordMatch) {
      return res.status(400).json({ message: 'Invalid old password' });
    }

    // Hash the new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update the admin's password
    await updatePassword(adminId, newPasswordHash);

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};