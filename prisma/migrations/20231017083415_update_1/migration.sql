/*
  Warnings:

  - Added the required column `disputeReason` to the `PartnerPayout` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `drawresult` MODIFY `drawConfigId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `gameentry` MODIFY `dailyDatasyncId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `partnerpayout` ADD COLUMN `disputeReason` VARCHAR(191) NOT NULL;
