import express from 'express';
import { adminLogin, forgotPassword, resetPassword, verifyOtp } from '../../controllers/auth/auth.controller';
import { validateLogin, validateForgotPassword, validateResetPassword, validateOtp } from '../../middlewares/validation.middleware';

const authRoutes = express.Router();

authRoutes.post('/login', validateLogin, adminLogin);
authRoutes.post('/verify-otp', validateOtp, verifyOtp);
authRoutes.post('/forget-password', validateForgotPassword, forgotPassword);
authRoutes.post('/reset-password', validateResetPassword, resetPassword);



export { authRoutes };