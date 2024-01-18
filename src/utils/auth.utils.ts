import jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { secretKey } from '../config/config';

function generateToken(payload: any): string {
  return jwt.sign(payload, secretKey, { expiresIn: '1h' });
}

function verifyToken(token: string): any {
  return jwt.verify(token, secretKey);
}

function hashPassword(plainPassword: string) {
  const saltRounds = 10;
  return bcrypt.hash(plainPassword, saltRounds);
}

function compareOTP(providedOTP: string, storedOTP: string): boolean {
  return providedOTP === storedOTP;
}

function generateSixDigitOTP() {
  const min = 100000;
  const max = 999999;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export { generateToken, verifyToken, hashPassword, compareOTP, generateSixDigitOTP };
