import express from 'express';
import { resolveBankController, getAllBanksController } from '../../controllers/bank.controller'

const bankRoutes = express.Router();

bankRoutes.get('/resolve', resolveBankController);
bankRoutes.get('/',getAllBanksController);

export { bankRoutes }