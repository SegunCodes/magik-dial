import express from 'express';
import { getHelloMessage } from '../controllers/example.controller';
import { datasyncWebhook } from '../controllers/datasync/webhook.datasync';
import { verifyOrigin } from '../middlewares/webhook.middleware';
import { ussdWebhook } from '../controllers/ussd/webhook';
import { processSmsRequest } from '../controllers/ussd/sms.webhook';
import { performScheduledDrawsCheck } from '../cronjob/draw.cronjob';


const router = express.Router();

router.get('/', getHelloMessage);
router.post('/datasync-webhook', datasyncWebhook);
router.post('/ussd-webhook', verifyOrigin, ussdWebhook);
router.post('/sms-webhook', verifyOrigin, processSmsRequest);
router.post('/trigger-scheduled-draw-check', performScheduledDrawsCheck);

export { router };