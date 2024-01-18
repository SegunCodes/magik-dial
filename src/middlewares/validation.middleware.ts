import express from 'express';
import { Schema, ValidationError } from 'joi';
import { changePasswordValidation, forgotPasswordValidation, loginValidation, resetPasswordValidation, otpValidation } from '../validations/auth.validation';
import { getProductsValidation, selectProductValidation, processWinValidation, bankDetailsValidation } from '../validations/ussd.validation';
import { smsCodeValidation, smsGameResultValidation, smsGameTypeValidation } from '../validations/sms.validation'
import { instantDrawValidation } from '../validations/admin.validation';

const validateRequest = (schema: Schema) => (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: (error as ValidationError).details[0].message });
  }
  next();
};

//auth validations
export const validateLogin = validateRequest(loginValidation);
export const validateOtp = validateRequest(otpValidation);
export const validateChangePassword = validateRequest(changePasswordValidation);
export const validateForgotPassword = validateRequest(forgotPasswordValidation);
export const validateResetPassword = validateRequest(resetPasswordValidation);

// ussd validations
export const validateUssdGetProducts = validateRequest(getProductsValidation);
export const validateUssdSelectProduct = validateRequest(selectProductValidation);
export const validateUssdProcessWin = validateRequest(processWinValidation);
export const validateBankDetails = validateRequest(bankDetailsValidation);

//sms validations 
export const validateSmsCode = validateRequest(smsCodeValidation);
export const validateSmsResult = validateRequest(smsGameResultValidation);
export const validateSmsGameType = validateRequest(smsGameTypeValidation);

// admin validations
export const validateInstantDraw = validateRequest(instantDrawValidation);