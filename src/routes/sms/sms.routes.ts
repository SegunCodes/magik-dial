import express from 'express';
import { validateSmsCode, validateSmsResult, validateSmsGameType, validateBankDetails } from '../../middlewares/validation.middleware';
import { sendCode, selectGame, processGameResults, updateBankDetails } from '../../controllers/sms/sms.controller';

const smsRoutes = express.Router();

smsRoutes.post('/send-code', validateSmsCode, sendCode);
smsRoutes.post('/select-game', validateSmsGameType, selectGame);
smsRoutes.post('/process-game', validateSmsResult, processGameResults);
smsRoutes.post('/add-bank', validateBankDetails, updateBankDetails);

export { smsRoutes };

