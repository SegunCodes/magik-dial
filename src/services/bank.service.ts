import axios from "axios";
import https from "https";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function resolveBank(bankAccountNumber: String, bankAccountCode: String ) {
  try {
    const queryParams = {
      account_number: bankAccountNumber as string,
      bank_code: bankAccountCode as string
    };
    const queryParamsString = new URLSearchParams(queryParams).toString();

    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: `/bank/resolve?account_number=${bankAccountNumber}&bank_code=${bankAccountCode}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    };

    const paystackResponse = await axios.get(
      `https://api.paystack.co/bank/resolve?${queryParamsString }`,
      options
    );

    return paystackResponse.data;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to resolve bank");
  }
}


//
export async function getAllBanks() {
  try {
    const options = {
      hostname: "api.paystack.co",
      port: 443,
      path: "/bank",
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    };

    const banksResponse = await axios.get(
      "https://api.paystack.co/bank",
      options
    );

    if (banksResponse.status === 200) {
      const banks = banksResponse.data;
      return banks;
    } else {
      throw new Error(
        `Failed to fetch banks - Status Code: ${banksResponse.status}`
      );
    }
  } catch (error) {
    console.error(error);
    throw new Error("Internal Server Error");
  }
}
