const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


//get all cashout request that is pending and processed 
export async function PayoutRequests(page: number, pageSize: number) {
    try {
      const currentDate = new Date();
      const skip = (page - 1) * pageSize;
  
      const payoutRequests = await prisma.cashOutRequest.findMany({
        where: {
          status:{in:['PENDING', 'PROCESSED']},
          type: {in:['AIRTIME', 'BANK']},
          createdAt: {
            lte: currentDate,
          },
        },
        skip, 
        take: pageSize, 
      });
  
      return payoutRequests;
    } catch (error) {
      throw error;
    }
  }
  


export  async function Disputed(id: string, disputedReason:string) {
    try {
      const updatedPayout = await prisma.cashOutRequest.update({
        where: { id },
        data: {
          status: "DISPUTED",
          disputeReason: disputedReason,
        },
      });
  
      return updatedPayout;
    } catch (error) {
     throw error
    } 
}



export async function Processed(id: string) {
  try {
    const updatedPayout = await prisma.cashOutRequest.update({
      where: { id },
      data: { status: "PROCESSED" },
    });

    return updatedPayout;
  } catch (error) {
    throw error;
  } 
}