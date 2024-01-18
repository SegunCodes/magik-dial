export enum UpdateTypeEnum {
    SUBSCRIBED = 'SUBSCRIBED',
    RENEWED = 'RENEWED',
    UNSUBSCRIBED = 'UNSUBSCRIBED',
    ONESHOT = 'ONESHOT',
}

export enum CashOutRequestType {
    AIRTIME = 'AIRTIME',
    BANK = 'BANK'
}
  
export enum CashOutRequestStatus {
    PENDING = 'PENDING',
    PROCESSED = 'PROCESSED',
    DISPUTED = 'DISPUTED'
}

export enum ProductTypeEnum {
    ONESHOT = 'ONESHOT',
    SUBSCRIPTION = 'SUBSCRIPTION'
}

export enum DrawConfigType {
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY',
    GRAND = 'GRAND'
}

export enum SMSDirection {
    INBOUND = 'INBOUND',
    OUTBOUND = 'OUTBOUND'
}