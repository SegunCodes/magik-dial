import { PrismaClient } from '@prisma/client';
import { isValidNumber } from 'libphonenumber-js';
import { SMSDirection } from '../helpers/enums';
import { PhoneNumber, Phonebook } from '../helpers/interface';
import { randomBytes } from 'crypto';
export interface PaginatedResult<T> {
  records: T;
  totalRecords: number;
  currentPage: number;
  pageSize: number;
  nextPage?: number | null;
}

const generateRandomToken = (length: number): string => {
  const token = randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
  return token;
};

const prisma = new PrismaClient();

export const sendBulkSMS = async (recipients: string[], message: string): Promise<void> => {
  try {
    const invalidRecipients: string[] = [];
    const sentSMS: string[] = [];

    // Loop through each recipient
    for (const recipient of recipients) {
      if (typeof recipient === 'string') {
        // It's a phone number
        if (validatePhoneNumber(recipient)) {
          await sendSMSToNumber(recipient, message);
          sentSMS.push(recipient);
        } else {
          invalidRecipients.push(recipient);
        }
      } else if (typeof recipient === 'object' && 'id' in recipient) {
        // It's a phonebook
        const phoneNumbers = await getPhonebookNumbers(recipient['id']);
        for (const phoneNumber of phoneNumbers) {
          if (validatePhoneNumber(phoneNumber)) {
            await sendSMSToNumber(phoneNumber, message);
            sentSMS.push(phoneNumber);
          } else {
            invalidRecipients.push(phoneNumber);
          }
        }
      }
    }

    // Save SMS records to the database
    await saveSMSRecords(sentSMS, invalidRecipients, message);

    console.log('Bulk SMS sent successfully');
  } catch (error) {
    console.error('Error sending bulk SMS:', error);
    throw error;
  }
};

export const validatePhoneNumber = (phoneNumber: string): boolean => {
  return isValidNumber(phoneNumber, 'NG');
};

// export const getPhonebookNumbers = async (phonebookId: string): Promise<string[]> => {
//   const phonebook = await prisma.phonebook.findUnique({
//     where: { phonebookId },
//     include: { phoneNumbers: true },
//   });

//   return phonebook?.phoneNumbers.map((entry: { number: string }) => entry.number) || [];
// };

export const getPhonebookNumbers = async (phonebookId: string): Promise<string[]> => {
  const phonebook = await prisma.phonebook.findUnique({
    where: { phonebookId },
    include: { phoneNumbers: true },
  });

  return phonebook?.phoneNumbers.map((phoneNumber: PhoneNumber) => phoneNumber.number) || [];
};

export const sendSMSToNumber = async (phoneNumber: string, message: string): Promise<void> => {
  // Implement logic to send SMS to the specified phone number
  console.log(`Sending SMS to ${phoneNumber}: ${message}`);
};

export const saveSMSRecords = async (
  sentSMS: string[],
  invalidRecipients: string[],
  message: string
): Promise<void> => {
  try {
    // Save successful SMS records
    await prisma.sMSHistory.createMany({
      data: sentSMS.map(msisdn => ({
        msisdn,
        message,
        direction: SMSDirection.OUTBOUND,
      })),
    });

    // Save unsuccessful SMS records
    await prisma.sMSHistory.createMany({
      data: invalidRecipients.map(msisdn => ({
        msisdn,
        message,
        direction: SMSDirection.INBOUND,
      })),
    });
  } catch (error) {
    console.error('Error saving SMS records:', error);
    throw error;
  }
};

export const fetchPhonebooks = async (
  page: number,
  pageSize: number
): Promise<PaginatedResult<Phonebook[]>> => {
  // Calculate the skip value based on pagination parameters
  const skip = (page - 1) * pageSize;

  // Implement logic to fetch paginated phonebooks with count of numbers from the database
  const [phonebooks, totalRecords] = await Promise.all([
    prisma.phonebook.findMany({
      include: {
        phoneNumbers: true, // Include associated phone numbers
      },
      skip,
      take: pageSize,
    }),
    prisma.phonebook.count(), // Get the total count of phonebooks
  ]);

  // Format the result to include count for each phone book
  const phonebooksWithCount: Phonebook[] = phonebooks.map((phonebook: Phonebook) => {
    return {
      id: phonebook.id,
      phonebookId: phonebook.phonebookId,
      phoneNumbers: phonebook.phoneNumbers,
    };
  });

  return {
    records: phonebooksWithCount,
    totalRecords,
    currentPage: page,
    pageSize,
    nextPage: totalRecords > page * pageSize ? page + 1 : null,
  };
};



export const uploadPhonebook = async (fileBuffer: Buffer): Promise<void> => {
  try {
    const phonebookData: { name: string; numbers: string[] }[] = [];

    // Parse the CSV from the Buffer
    const csvString = fileBuffer.toString('utf-8');

    // Read the CSV data
    csvString
      .split('\n')
      .map(row => row.trim())
      .filter(Boolean) // Remove empty lines
      .forEach(row => {
        const [name, numbers] = row.split(',').map(item => item.trim());

        if (name && numbers) {
          const numberArray = numbers.split(',').map(num => num.trim());
          phonebookData.push({ name, numbers: numberArray });
        }
      });

    // Save data to the database
    for (const entry of phonebookData) {
      const phonebookId = generateRandomToken(12);

      // Create Phonebook entry
      const createdPhonebook = await prisma.phonebook.create({
        data: {
          phonebookId,
        },
      });

      console.log(`Phonebook created with id: ${createdPhonebook.id}`);

      // Create associated PhoneNumber entries
      for (const number of entry.numbers) {
        await prisma.phoneNumber.create({
          data: {
            name: entry.name,
            number,
            phonebookId: createdPhonebook.phonebookId,
          },
        });
      }
    }

    console.log('Phonebook upload complete');
  } catch (error) {
    console.error('Error uploading phonebook:', error);
    throw error;
  }
};

export async function fetchPhonebook(phonebookId: string) {
  try {
    // Find the phonebook with the given ID
    const phonebook = await prisma.phonebook.findUnique({
      where: { phonebookId: phonebookId },
      include: { phoneNumbers: true }, // Include associated phone numbers
    });


    if (!phonebook) {
      return null
    } else {
      return phonebook
    }
  } catch (error) {
    console.error('Error fetching phonebook:', error);
    throw error;
  }
}

export const deletePhonebook = async (phonebookId: string): Promise<boolean> => {
  try {
    // Find the phonebook with the given ID
    const phonebook = await prisma.phonebook.findUnique({
      where: { phonebookId: phonebookId },
      include: { phoneNumbers: true }, // Include associated phone numbers
    });

    if (!phonebook) {
      return false;
    }

    // Delete the phonebook and associated phone numbers
    await prisma.phonebook.delete({
      where: { phonebookId: phonebookId },
    });

    // Delete associated phone numbers
    if (phonebook.phoneNumbers.length > 0) {
      const phoneNumbersIds = (phonebook.phoneNumbers || []).map((phoneNumber: { id: string }) => phoneNumber.id);
      await prisma.phoneNumber.deleteMany({
        where: {
          id: {
            in: phoneNumbersIds,
          },
        },
      });
    }
    return true;
  } catch (error) {
    console.error('Error deleting phonebook:', error);
    throw error;
  }
};
export const getSMSStatistics = async (days: number): Promise<any> => {
  try {
    const startDate = getStartDate(days);

    // Fetch SMS statistics using the startDate
    const smsStatistics = await prisma.sMSHistory.groupBy({
      by: ['direction'],
      _count: true,
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    });

    /**
     * NOTE
     * :  This needs a fix based off business logic for sent, failed etc
     */
    const statistics = {
      sent: 0,
      failed: 0,
      delivered: 0,
      received: 0, 
      optOut: 0,
    };

    return { success: true, statistics };
  } catch (error) {
    console.error('Error fetching statistics:', error);
    throw error;
  }
};

// Helper function to get the start date based on the provided days
const getStartDate = (days: number): Date => {
  const currentDate = new Date();
  const startDate = new Date(currentDate);
  startDate.setDate(currentDate.getDate() - days);
  return startDate;
};
