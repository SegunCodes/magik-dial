/*
  Warnings:

  - You are about to drop the column `name` on the `phonebook` table. All the data in the column will be lost.
  - Added the required column `name` to the `PhoneNumber` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `phonebook` DROP COLUMN `name`;

-- AlterTable
ALTER TABLE `phonenumber` ADD COLUMN `name` VARCHAR(191) NOT NULL;
