-- CreateTable
CREATE TABLE `Admin` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `accountType` VARCHAR(191) NOT NULL,
    `isBanned` BOOLEAN NOT NULL,
    `twoFaEnabled` BOOLEAN NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Admin_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `msisdn` VARCHAR(191) NOT NULL,
    `bankAccountNumber` BIGINT NULL,
    `bankName` VARCHAR(191) NULL,
    `bankAccountCode` VARCHAR(191) NULL,
    `bankAccountName` VARCHAR(191) NULL,
    `balance` DOUBLE NOT NULL DEFAULT 0,
    `isBanned` BOOLEAN NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_msisdn_key`(`msisdn`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Datasync` (
    `id` VARCHAR(191) NOT NULL,
    `msisdn` VARCHAR(191) NOT NULL,
    `serviceId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `subscribed` BOOLEAN NOT NULL,
    `updateType` ENUM('SUBSCRIBED', 'RENEWED', 'UNSUBSCRIBED', 'ONESHOT') NOT NULL,
    `subExpiryTime` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DailyDatasync` (
    `id` VARCHAR(191) NOT NULL,
    `msisdn` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `updateType` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Service` (
    `id` VARCHAR(191) NOT NULL,
    `externalId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `shortcode` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Service_externalId_key`(`externalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` VARCHAR(191) NOT NULL,
    `externalId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('ONESHOT', 'SUBSCRIPTION') NOT NULL,
    `serviceId` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL,
    `shortCode` VARCHAR(191) NOT NULL,
    `entryChannels` VARCHAR(191) NOT NULL,
    `networks` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Product_externalId_key`(`externalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GameEntry` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `msisdn` VARCHAR(191) NOT NULL,
    `dailyDatasyncId` BIGINT NOT NULL,
    `validUntil` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DrawPool` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `msisdns` VARCHAR(191) NOT NULL,
    `validUntil` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DrawConfig` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `type` ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'GRAND') NOT NULL,
    `shouldRunAutomatically` BOOLEAN NOT NULL,
    `shouldRunAutomaticallyUntilDate` DATETIME(3) NULL,
    `isEnabled` BOOLEAN NOT NULL,
    `winnablePercentage` DOUBLE NOT NULL,
    `winnersPerPool` BIGINT NOT NULL,
    `totalPoolSize` BIGINT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DrawResult` (
    `id` VARCHAR(191) NOT NULL,
    `drawConfigId` BIGINT NOT NULL,
    `winners` VARCHAR(191) NOT NULL,
    `winnablePercentage` DOUBLE NOT NULL,
    `winnableAmount` DOUBLE NOT NULL,
    `winnersPerPool` BIGINT NOT NULL,
    `totalPoolSize` BIGINT NOT NULL,
    `totalAmount` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Winner` (
    `id` VARCHAR(191) NOT NULL,
    `msisdn` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `drawId` VARCHAR(191) NOT NULL,
    `amountWon` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Partner` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `PrimaryContactEmail` VARCHAR(191) NULL,
    `PrimaryContactPhone` VARCHAR(191) NULL,
    `bankAccountName` VARCHAR(191) NULL,
    `bankName` VARCHAR(191) NULL,
    `bankCode` VARCHAR(191) NULL,
    `bankAccountNumber` VARCHAR(191) NULL,
    `shouldReceiveRevenue` BOOLEAN NOT NULL,
    `revenueSharePercentage` DOUBLE NOT NULL,
    `currentBalance` DOUBLE NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Partner_PrimaryContactEmail_key`(`PrimaryContactEmail`),
    UNIQUE INDEX `Partner_PrimaryContactPhone_key`(`PrimaryContactPhone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CashOutRequest` (
    `id` VARCHAR(191) NOT NULL,
    `msisdn` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `type` ENUM('AIRTIME', 'BANK') NOT NULL,
    `status` ENUM('PENDING', 'PROCESSED', 'DISPUTED') NOT NULL,
    `disputeReason` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PartnerEarning` (
    `id` VARCHAR(191) NOT NULL,
    `partnerId` VARCHAR(191) NOT NULL,
    `drawResultId` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `earningPercentage` DOUBLE NOT NULL,
    `disputeReason` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PartnerPayout` (
    `id` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `status` ENUM('PENDING', 'PROCESSED', 'DISPUTED') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UssdSession` (
    `id` VARCHAR(191) NOT NULL,
    `msisdn` VARCHAR(191) NOT NULL,
    `shortcode` VARCHAR(191) NOT NULL,
    `externalSessionId` VARCHAR(191) NOT NULL,
    `responses` VARCHAR(191) NOT NULL,
    `expired` BOOLEAN NOT NULL,
    `lastResponse` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SMSHistory` (
    `id` VARCHAR(191) NOT NULL,
    `msisdn` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `direction` ENUM('INBOUND', 'OUTBOUND') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Audit` (
    `id` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `actionBy` ENUM('SYSTEM', 'ADMIN', 'SUBSCRIBER') NOT NULL,
    `actionByUuid` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
