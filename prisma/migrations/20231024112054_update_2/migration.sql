/*
  Warnings:

  - Added the required column `numberOfWinners` to the `ScheduledDraws` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `scheduleddraws` ADD COLUMN `numberOfWinners` VARCHAR(191) NOT NULL;
