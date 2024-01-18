import express from 'express';
import {
  createPartnerHandler,
  updatePartnerHandler,
  enablePartnerHandler,
  disablePartnerHandler,
  deletePartnerHandler,
  initiatePayoutHandler,
  markPayoutAsDisputedHandler,
  markPayoutAsProcessedHandler,
  updateDisputeReasonHandler,
  getPayoutByIdHandler
} from '../../controllers/partner/partner.controller'; 

const partnerRoutes = express.Router();


// Create a new partner
partnerRoutes.post('/', createPartnerHandler);

// Update an existing partner by ID
partnerRoutes.put('/:id', updatePartnerHandler);

// Enable a partner by ID
partnerRoutes.patch('/enable/:id', enablePartnerHandler);

// Disable a partner by ID
partnerRoutes.patch('/disable/:id', disablePartnerHandler);

// Delete a partner by ID
partnerRoutes.delete('/:id', deletePartnerHandler);

//initialize partner's payout
partnerRoutes.post('/initiate', initiatePayoutHandler);

// Mark Payout as Processed
partnerRoutes.patch('/:id/mark-processed', markPayoutAsProcessedHandler);

// Mark Payout as Disputed
partnerRoutes.patch('/:id/mark-disputed', markPayoutAsDisputedHandler);

// Update Dispute Reason (if marked as disputed)
partnerRoutes.patch('/:id/update-dispute-reason', updateDisputeReasonHandler);

// Get Payout by ID
partnerRoutes.get('/:id', getPayoutByIdHandler);

export {partnerRoutes };
