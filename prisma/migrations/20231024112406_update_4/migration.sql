/*
  Warnings:

  - You are about to alter the column `numberOfWinners` on the `scheduleddraws` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `scheduleddraws` MODIFY `numberOfWinners` INTEGER NOT NULL;
