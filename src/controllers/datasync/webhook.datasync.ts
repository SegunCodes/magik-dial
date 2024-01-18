import { Request, Response } from 'express';
import { findById, createUser } from '../../services/user.service';
import { upsertDatasyncRecord, createDailyDatasyncRecord } from '../../services/datasync.service';
import { UpdateTypeEnum } from '../../helpers/enums';

export const datasyncWebhook = async (req: Request, res: Response) => {
    try {
      const {
        spId,
        userId,
        serviceId,
        productId,
        statusCode,
        commandType,
        updateTime,
        effectiveTime,
        expiryTime,
        accessCode,
        chargeMode,
        chargeNumber,
        unsubscriptionMode,
        startTime,
        isFreePeriod,
        operatorId,
        durationGracePeriod,
        canUseServiceInGracePeriod,
        durationSuspendPeriod,
        chargingSuccess,
        updateReason,
      } = req.body;
      
      // Check if the user exists in the User table
      let user = await findById(userId)
  
      if (!user) {
        user = await createUser(userId);
      }

      let updateType: UpdateTypeEnum;

      if (chargeMode === "one-time") {
        updateType = UpdateTypeEnum.ONESHOT;
      } else if (chargeMode === "day" || chargeMode === "week" || chargeMode === "month") {
        updateType = UpdateTypeEnum.SUBSCRIBED;
      } else if (statusCode === "stInactive" || statusCode === "stSuspended") {
        updateType = UpdateTypeEnum.UNSUBSCRIBED;
      } else {
        updateType = UpdateTypeEnum.RENEWED;
      }
  
      const isoDate = new Date(expiryTime).toISOString();

      // handle datasync     
      await upsertDatasyncRecord(userId, serviceId, productId, updateType, isoDate);
  
      // Log daily Datasync record
      await createDailyDatasyncRecord(userId, productId, updateType);
  
      // Respond with a success status
      res.status(200).json({ message: 'Webhook notification processed successfully' });
    } catch (error) {
      console.error('Webhook processing error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };