import { Request, Response } from 'express';
const payoutService = require('../../services/payout.service');



//pending and processed payout request
export async function getPayoutRequests  (req: Request, res: Response)  {
  try {
    const { page="1", pageSize="10"} = req.query; 

    const pageNumber = parseInt(page as string, 10);
    const pageSizeNumber = parseInt(pageSize as string, 10);

    const payoutRequests = await payoutService.PayoutRequests(pageNumber, pageSizeNumber);
    res.status(200).json({ payoutRequests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching payout requests.' });
  }
};

//
export async function markPayoutAsDisputed(req:Request, res: Response) {
  const { id } = req.params;
  const { disputedReason } = req.body;

  try {
    const updatedPayout = await payoutService.Disputed(id, disputedReason);
    res.status(200).json({updatedPayout});
  } catch (error: any) {
    res.status(500).json({ error: error.message,
      response:'An error occurred while updating the payout status.' });
  }
}

export async function markPayoutAsProcessed(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const updatedPayout = await payoutService.Processed(id);
    res.status(200).json(updatedPayout);
  } catch (error :any) {
    res.status(500).json({ 
      error: error.message,
      message: 'An error occurred while updating the payout status.' });
  }
}