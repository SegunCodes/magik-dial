import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { PartnerTypes} from '../utils/types';


export async function createPartner(partnerData: PartnerTypes ) {
  try {
    const partner = await prisma.partner.create({
      data: partnerData,
    });
    return partner;
  } catch (error) {
    throw error;
  }
}

export async function updatePartner(id: string, partnerData: PartnerTypes) {
  try {
    const partner = await prisma.partner.update({
      where: { id },
      data: partnerData,
    });
    return partner;
  } catch (error) {
    throw error;
  }
}

export async function enablePartner(id: string) {
  try {
    const partner = await prisma.partner.update({
      where: { id },
      data: { shouldReceiveRevenue: true },
    });
    return partner;
  } catch (error) {
    throw error;
  }
}

export async function disablePartner(id: string) {
  try {
    const partner = await prisma.partner.update({
      where: { id },
      data: { shouldReceiveRevenue: false },
    });
    return partner;
  } catch (error) {
    throw error;
  }
}

export async function deletePartner(id: string) {
  try {
    const partner = await prisma.partner.delete({
      where: { id },
    });
    return partner;
  } catch (error) {
    throw error;
  }
}


export const initiatePayout = async (amount: number) => {
  try {
    const payout = await prisma.partnerPayout.create({
      data: {
        amount,
        status: 'PENDING', 
        disputeReason: ''
      },
    });

    return payout;
  } catch (error) {
    throw error;
  }
};


export const markPayoutAsProcessed = async (id: string) => {
  try {
    const payout = await prisma.partnerPayout.update({
      where: { id },
      data: {
        status: 'PROCESSED',
      },
    });

    return payout;
  } catch (error) {
    throw error;
  }
};

export const markPayoutAsDisputed = async (id: string) => {
  try {
    const payout = await prisma.partnerPayout.update({
      where: { id },
      data: {
        status: 'DISPUTED',
      },
    });

    return payout;
  } catch (error) {
    throw error;
  }
};

export const updateDisputeReason = async (id: string, disputeReason: string) => {
  try {
    const payout = await prisma.partnerPayout.update({
      where: { id },
      data: {
        status: 'DISPUTED',
        disputeReason,
      },
    });

    return payout;
  } catch (error) {
    throw error;
  }
};

export const getPayoutById = async (id: string) => {
  try {
    const payout = await prisma.partnerPayout.findUnique({
      where: { id },
    });

    return payout;
  } catch (error) {
    throw error;
  }
};
