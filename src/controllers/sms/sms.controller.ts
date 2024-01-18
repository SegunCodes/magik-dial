import { Request, Response } from 'express';
import { getProducts, findWinnerById, createCashOutRequest, getProductsByKeyword } from '../../services/products.service';
import { CashOutRequestType } from '../../helpers/enums';
import { findById, updateUserBankDetails } from '../../services/user.service';
import { Product } from '../../helpers/interface';

export const sendCode = async (req: Request, res: Response) => {
    try {
        const { code } = req.body;

        if (code === "START") {
            const products: Product[] = await getProducts(); // Assuming Product is the correct type
            const responseData = products.map((product: Product) => {
                return {
                    name: product.name,
                    serviceId: product.serviceId,
                    amount: product.amount,
                    description: product.description,
                    productkeyword: product.productKeyword
                };
            });
            
            res.status(200).json({ 
                status: true,
                message: responseData
            });
        } else {
            res.status(400).json({ 
                status: false,
                message: 'Invalid code. Please send "START" to play the game.' 
            });
        }
    } catch (error) {
        console.error('send code error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const selectGame = async (req: Request, res: Response) => {
    try {
      const { gametype } = req.body;
  
      const products = await getProductsByKeyword(gametype);
  
      if (products.length > 0) {
        const responseMessage = `Congratulations, you have subscribed to the daily instant game of N${products[0].amount}. To opt out, send STOP.`;
        res.status(200).json({ message: responseMessage });
      } else {
        res.status(400).json({ message: 'Invalid type' });
      }
    } catch (error) {
      console.error('selectGame error:', error);
      res.status(500).json({ message: 'Server error' });
    }
};  

export const processGameResults = async (req: Request, res: Response) => {
    try {
        const { resultType } = req.body;

        const resultTypeResponses: Record<string, string> = {
            "won": "Congratulations, you have won,To cashout with airtime, send AIRTIME. To cash out with send BANK",
            "lost": "Sorry, you lost. Try again by sending p2",
        };

        const responseMessage = resultTypeResponses[resultType];

        if (responseMessage) {
            res.status(200).json({ message: responseMessage });
        } else {
            res.status(400).json({ message: 'Invalid type' });
        }
    } catch (error) {
        console.error('selectGame error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateBankDetails = async (req: Request, res: Response) => {
    try {
        const { bankAccount, bankName, AccountName, msisdn } = req.body;
        
        // Fetch user balance
        const user = await findById(msisdn);   

        if (!user) {
            return res.status(400).json({
                message: "Unable to fetch user."
            });
        }

        //create cash out request
        const amount = user.balance;
        await createCashOutRequest(msisdn, amount, CashOutRequestType.BANK);

        // Update user with bank details
        await updateUserBankDetails(msisdn, bankAccount, bankName, AccountName);
        
        return res.status(200).json({
            message: "Bank details updated successfully"
        });
    } catch (error) {
        console.error('update bank details error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
