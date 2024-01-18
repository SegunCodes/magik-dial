import { Request, Response } from 'express';
import {
  createPartner,
  updatePartner,
  enablePartner,
  disablePartner,
  deletePartner,
  initiatePayout,
  markPayoutAsDisputed,
  markPayoutAsProcessed,
  updateDisputeReason,
  getPayoutById,
} from '../../services/partner.service';

export const createPartnerHandler = async (req: Request, res: Response) => {
  try {
    const partnerData = req.body;
    const partner = await createPartner(partnerData);
    res.json(partner);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePartnerHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const partnerData = req.body;
    const partner = await updatePartner(id, partnerData);
    res.json(partner);
  } catch (error: any) {
    res.status(500).json({ error: error.message, message:"server error" });
  }
};

export const enablePartnerHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const partner = await enablePartner(id);
    res.json(partner);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const disablePartnerHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const partner = await disablePartner(id);
    res.json(partner);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deletePartnerHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const partner = await deletePartner(id);
    res.status(204).json(partner);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};



export const initiatePayoutHandler = async (req: Request, res: Response) => {
  const { amount } = req.body;
  try {
    const payout = await initiatePayout(amount);
    res.json(payout);
  } catch (error:any) {
    res.status(500).json({ error: error.message });
  }
};

export const markPayoutAsProcessedHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const payout = await markPayoutAsProcessed(id);
    res.json(payout);
  } catch (error:any) {
    res.status(500).json({ error: error.message });
  }
};

export const markPayoutAsDisputedHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const payout = await markPayoutAsDisputed(id);
    res.json(payout);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateDisputeReasonHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { disputeReason } = req.body;
  try {
    const payout = await updateDisputeReason(id, disputeReason);
    res.json(payout);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPayoutByIdHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const payout = await getPayoutById(id);
    if (!payout) {
      res.status(404).json({ error: 'Payout not found' });
    } else {
      res.json(payout);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
