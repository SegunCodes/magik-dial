/*
  Warnings:

  - You are about to alter the column `updateType` on the `dailydatasync` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.

*/
-- AlterTable
ALTER TABLE `dailydatasync` MODIFY `updateType` ENUM('SUBSCRIBED', 'RENEWED', 'UNSUBSCRIBED', 'ONESHOT') NOT NULL;

-- AddForeignKey
ALTER TABLE `DailyDatasync` ADD CONSTRAINT `DailyDatasync_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
