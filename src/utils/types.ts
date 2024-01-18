import { ProductTypeEnum } from '../helpers/enums'

export interface EmailDataTypes {
    from: string,
    to: string,
    subject: string,
    html: string,
}

export interface PartnerTypes {
    id?: string; 
    name: string;
    PrimaryContactEmail?: string;
    PrimaryContactPhone?: string;
    bankAccountName?: string;
    bankName?: string;
    bankCode?: string;
    bankAccountNumber?: string;
    shouldReceiveRevenue: boolean;
    revenueSharePercentage: number;
    currentBalance?: number; 
    createdAt?: Date;
    updatedAt?: Date;
}  

export interface ProductTypes {
    id: string;
    externalId: string;
    name: string;
    serviceId: string;
    amount: number;
    description: string;
    type: ProductTypeEnum;
    isActive: boolean;
    shortCode: string;
    entryChannels: string;
    networks: string;
    productKeyword: string;
}