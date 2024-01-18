import { UpdateTypeEnum } from "./enums";
export interface User {
    id: string;
    msisdn: string;
    bankAccountNumber?: string | null;
    bankName?: string | null;
    bankAccountCode?: string | null;
    bankAccountName?: string | null;
    balance: number;
    isBanned: boolean;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}
  
export interface SubscribedProduct {
    productId: string;
    msisdn: string;
    serviceId: string;
    subscribed: boolean;
}

export interface Product {
    id: string;
    externalId: string;
    name: string;
    serviceId: string;
    amount: number;
    description: string;
    isActive: boolean;
    shortCode: string;
    entryChannels: string;
    networks: string;
    productKeyword: string;
}

export interface DrawConfig {
    id: string;
    productId: string;
    shouldRunAutomatically: boolean;
    shouldRunAutomaticallyUntilDate: Date | null;
    isEnabled: boolean;
    winnablePercentage: number;
    winnersPerPool: number | bigint;
    totalPoolSize: number | bigint;
}

export interface DrawResult {
    id: string;
    drawConfigId: string;
    winners: string;
    winnablePercentage: number;
    winnableAmount: number;
    winnersPerPool: number | bigint;
    totalPoolSize: number | bigint;
    totalAmount: number;
}
export interface DrawResultFilter {
    drawConfig?: {
      type: string | string[];
    };
    createdAt?: {
      gte: Date;
      lte: Date;
    };
}
  
export interface Phonebook {
    id: string;
    phonebookId: string;
    phoneNumbers: PhoneNumber[];
  }
  
export interface PhoneNumber {
    id: string;
    name: string;
    number: string;
    phonebookId: string;
    phonebook?: Partial<Phonebook>;
}
  
export interface Datasync {
    id: string;
    msisdn: string;
    serviceId: string;
    productId: string;
    subscribed: boolean;
    subExpiryTime: Date;
    createdAt: Date;
    updatedAt: Date;
}
  
export interface DailyDatasync {
    id: string;
    msisdn: string;
    productId: string;
    createdAt: Date;
    product: Product | null; 
}

export interface Winner {
    id: string;
    msisdn: string;
    productId: string;
    drawId: string;
    amountWon: number; 
    createdAt: Date;
    updatedAt: Date;
}
  