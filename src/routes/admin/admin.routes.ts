import express from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { validateChangePassword, validateInstantDraw } from '../../middlewares/validation.middleware';
import { getPayoutRequests, markPayoutAsDisputed, markPayoutAsProcessed} from '../../controllers/payout/payout.controller';
import { changePassword } from '../../controllers/auth/auth.controller';
import { getSingleUser, getAllUsers } from '../../controllers/user/user.controller';
import { getDailyDatasyncRecords, getMainDatasyncRecords, getAllActiveGames } from '../../controllers/datasync/datasync.controller';
import { getTotalSubscribers } from '../../controllers/user/subcribe.controller';
import { 
    performInstantDraw, 
    scheduleDraw,
    drawHistory, 
    fetchSingleDraw, 
    fetchWinnersForDraw, 
    createDrawConfig, 
    getDrawConfig, 
    updateDrawConfig, 
    deleteDrawConfig, 
    getDrawConfigs 
} from "../../controllers/draw/draw.controller"
import { dailyRevenueGraph, getTotalRevenueController, monthlyRevenueGraph} from "../../controllers/user/revenue.controller"
import { createCashOutRequestHandler } from '../../controllers/ussd/flow.ussd';
import { createProductHandler,enableProductHandler,disableProductHandler,deleteProductHandler } from '../../controllers/product/product.controller';
import { 
    sendSMS, 
    getPhonebooks, 
    uploadPhonebookHandler, 
    deletePhonebookHandler,
    replacePhonebookHandler,
    getSMSStatisticsHandler,
    getPhonebook
} from '../../controllers/bulksms/bulksms.controller';
const adminRoutes = express.Router();
import multer from 'multer';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


adminRoutes.post('/change-password', authenticate, validateChangePassword, changePassword);
adminRoutes.get('/user/:userId', authenticate, getSingleUser);
adminRoutes.get('/users', authenticate, getAllUsers);
adminRoutes.get('/daily-datasync-records', authenticate, getDailyDatasyncRecords);
adminRoutes.get('/datasync-records', authenticate, getMainDatasyncRecords);
adminRoutes.get('/total-subscribers', authenticate, getTotalSubscribers);
adminRoutes.get('/total-revenue', authenticate, getTotalRevenueController);
adminRoutes.get('/monthly-data', authenticate, monthlyRevenueGraph);
adminRoutes.get('/daily-data', authenticate,  dailyRevenueGraph)
adminRoutes.get('/total-active-games', authenticate, getAllActiveGames);

adminRoutes.post('/instant-draw/:productId', authenticate, validateInstantDraw, performInstantDraw);
adminRoutes.post('/schedule-draw', authenticate, scheduleDraw);
adminRoutes.get('/draw-history', authenticate, drawHistory);
adminRoutes.get('/draw/:drawId', authenticate, fetchSingleDraw);
adminRoutes.get('/draw/:drawId/winners', authenticate, fetchWinnersForDraw);
adminRoutes.post('/draw-configs', authenticate, createDrawConfig);
adminRoutes.get('/draw-configs/:id', authenticate, getDrawConfig);
adminRoutes.get('/draw-configs', authenticate, getDrawConfigs);
adminRoutes.put('/draw-configs/:id', authenticate, updateDrawConfig);
adminRoutes.delete('/draw-configs/:id', authenticate, deleteDrawConfig);

adminRoutes.get('/payout',authenticate, authenticate, getPayoutRequests);
adminRoutes.patch('/payout/disputed/:id', authenticate, markPayoutAsDisputed);
adminRoutes.patch('/payout/processed/:id', authenticate, markPayoutAsProcessed)
adminRoutes.post('/cashout', authenticate, createCashOutRequestHandler);
adminRoutes.post('/create-product', authenticate,createProductHandler);
adminRoutes.patch('/enable-product/:id', authenticate, enableProductHandler);
adminRoutes.patch('/disable-product/:id', authenticate, disableProductHandler);
adminRoutes.delete('/delete/:id', authenticate, deleteProductHandler)

//bulksms
adminRoutes.post('/send-bulk-sms', authenticate, sendSMS);
adminRoutes.get('/phonebooks', authenticate, getPhonebooks);
adminRoutes.post('/upload-phonebook', authenticate, upload.single('file'), uploadPhonebookHandler);
adminRoutes.post('/delete-phonebook/:phonebookId', authenticate, deletePhonebookHandler);
adminRoutes.get('/fetch-phonebook/:phonebookId', authenticate, getPhonebook);
adminRoutes.post('/replace-phonebook/:phonebookId', authenticate, upload.single('file'), replacePhonebookHandler);
adminRoutes.get('/sms-stats', authenticate, getSMSStatisticsHandler);

export { adminRoutes };




