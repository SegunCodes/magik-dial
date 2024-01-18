/*
  Warnings:

  - Added the required column `amount` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `admin` ADD COLUMN `otp` VARCHAR(191) NULL,
    ADD COLUMN `resetToken` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `product` ADD COLUMN `amount` DOUBLE NOT NULL;
