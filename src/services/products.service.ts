import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { CashOutRequestType, CashOutRequestStatus } from '../helpers/enums';
import { ProductTypes } from '../utils/types'

export async function getProducts() { 
    return prisma.product.findMany();
}

export async function findWinnerById(msisdn: string) {
    return prisma.winner.findMany({ where: { msisdn: msisdn } });
}

export async function createCashOutRequest(msisdn: string, amount: number, type: CashOutRequestType) {
    try {
      await prisma.cashOutRequest.create({
        data: {
          msisdn,
          amount,
          type,
          status: CashOutRequestStatus.PENDING,
        },
      });
    } catch (error) {
      console.error('Error creating CashOutRequest:', error);
      throw error;
    }
}

//create product
export async function createProduct(productData: ProductTypes){
   try{
    const product = await prisma.product.create({
      data: productData
   })
   return product
  } catch(error){
    throw error;
  }
}

//enable product
export async function enableProduct(id: string){
  try{
    const enable = await prisma.product.update({
      where: { id },
      data :{
        isActive: true
      }
    })
    return enable
  }catch (error){
    throw error ;
  }
}

//disable product
export async function disableProduct(id: string){
  try{
  const disable = await prisma.product.update({
    where: { id},
    data: { isActive: false}
  })
  return disable
  } catch(error){
    throw error
  }
}

//delete product 
export async function deleteProduct(id: string){
  try{
       const clear = await prisma.product.delete({
        where: {
          id
        }
       })
       return clear
  } catch (error){
    throw error
  }
}

export async function getProductsByKeyword(productKeyword: string) {
  try {
    const products = await prisma.product.findMany({
      where: {
        productKeyword: productKeyword,
      },
    });
    return products;
  } catch (error) {
    console.error('Error fetching products by shortCode:', error);
    throw error;
  }
}