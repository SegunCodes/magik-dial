import Joi from 'joi';

export const changePasswordValidation = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(), 
});

export const loginValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const otpValidation = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().required(),
});

export const forgotPasswordValidation = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPasswordValidation = Joi.object({
  resetToken: Joi.string().required(),
  newPassword: Joi.string().min(6).required(), 
});