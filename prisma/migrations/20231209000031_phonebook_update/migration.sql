/*
  Warnings:

  - A unique constraint covering the columns `[phonebookId]` on the table `Phonebook` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `phonebookId` to the `Phonebook` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `phonenumber` DROP FOREIGN KEY `PhoneNumber_phonebookId_fkey`;

-- AlterTable
ALTER TABLE `phonebook` ADD COLUMN `phonebookId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Phonebook_phonebookId_key` ON `Phonebook`(`phonebookId`);

-- AddForeignKey
ALTER TABLE `PhoneNumber` ADD CONSTRAINT `PhoneNumber_phonebookId_fkey` FOREIGN KEY (`phonebookId`) REFERENCES `Phonebook`(`phonebookId`) ON DELETE RESTRICT ON UPDATE CASCADE;
