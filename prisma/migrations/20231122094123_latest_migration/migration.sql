-- CreateTable
CREATE TABLE `Phonebook` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PhoneNumber` (
    `id` VARCHAR(191) NOT NULL,
    `number` VARCHAR(191) NOT NULL,
    `phonebookId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PhoneNumber` ADD CONSTRAINT `PhoneNumber_phonebookId_fkey` FOREIGN KEY (`phonebookId`) REFERENCES `Phonebook`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
