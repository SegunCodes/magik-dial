import { Request, Response } from 'express';
import {
  getProducts,
  findWinnerById,
  createCashOutRequest,
  getProductsByKeyword,
} from '../../services/products.service';
import {
  findById,
  updateUserBankDetails,
} from '../../services/user.service';
import { CashOutRequestType } from '../../helpers/enums';
import { Product } from '../../helpers/interface';

interface SmsRequest {
  userResponse?: string;
  msisdn?: string;
}

interface SmsResponse {
    status: boolean;
    message: string;
}  

export const processSmsRequest = async (
  req: Request,
  res: Response<SmsResponse>
) => {
  try {
    const {
      userResponse,
      msisdn,
    }: SmsRequest = req.body;

    if (userResponse === 'START') {
      // Handle START code
      const products: Product[] = await getProducts();
      const responseMessage = `For ${products
        .map(
          (product) =>
            `${product.name}, reply with ${product.productKeyword}`
        )
        .join('\n')}`;

      res.status(200).json({ status: true, message: responseMessage })
    } else if (userResponse == "P1" || userResponse == "P2" || userResponse == "P3" || userResponse == "P4") {
      // Handle gametype
      const products = await getProductsByKeyword(userResponse);

      if (products.length > 0) {
        const responseMessage = `Congratulations, you have subscribed to the daily instant game of N${products[0].amount}. To opt out, send STOP.`;
        res.status(200).json({ status: true, message: responseMessage });
      } else {
        res.status(400).json({ status: false, message: 'Invalid type' });
      }
    }  else if (userResponse == "won" || userResponse == "lost") {
      // Handle game results
      const resultTypeResponses: Record<string, string> = {
        won:
          'Congratulations, you have won. To cashout with airtime, send AIRTIME. To cash out with send BANK',
        lost: 'Sorry, you lost. Try again by sending START',
      };

      const responseMessage = resultTypeResponses[userResponse];

      if (responseMessage) {
        res.status(200).json({ status: true, message: responseMessage });
      } else {
        res.status(400).json({ status: false, message: 'Invalid type' });
      }
    }  else if (userResponse == "STOP") {
      const responseMessage = `You have opted out of this product`;
      res.status(200).json({ status: true, message: responseMessage });
    }else {
      res.status(400).json({
        status: false,
        message:
          'Invalid request. Please provide a valid code, gametype, or resultType.',
      });
    }
  } catch (error) {
    console.error('SMS request processing error:', error);
    res.status(500).json({ status: false, message: 'Server error' });
  }
};
