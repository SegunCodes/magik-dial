import { Request, Response } from 'express';
import { resolveBank, getAllBanks } from '../services/bank.service'


export async function resolveBankController(req: Request, res: Response) {
  const { bankAccountNumber, bankAccountCode } = req.query;

  if (bankAccountNumber === undefined || bankAccountCode === undefined) {
    res.status(400).json({ error: 'Invalid bank account number or bank account code' });
  }
  try {
    
    const result = await resolveBank(bankAccountNumber as string , bankAccountCode as string);

    if (!result) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(result);
  } catch (error) {
    console.log(error);
     return res.status(500).json({ error:"internal server error" })
  }
}




//list all banks
export async function getAllBanksController(req: Request, res: Response) {
  try {
    const banks = await getAllBanks();
    res.status(200).json({ data: banks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
