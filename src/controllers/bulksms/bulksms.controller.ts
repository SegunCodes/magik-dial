import { Request, Response } from 'express';
import {
  sendBulkSMS,
  fetchPhonebooks,
  uploadPhonebook,
  deletePhonebook,
  getSMSStatistics,
  getPhonebookNumbers,
  fetchPhonebook,
} from '../../services/bulksms.service'; 
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export const sendSMS = async (req: Request, res: Response) => {
  try {
    const { recipients, phonebookId, message } = req.body;

    if ((!recipients && !phonebookId) || !message) {
      return res.status(400).json({ status: false, message: 'Invalid request body' });
    }

    if (recipients && !phonebookId) {
      // Case 1: Phone Numbers
      await sendBulkSMS(recipients, message);
    } else if (!recipients && phonebookId) {
      // Case 2: Phonebook
      const phonebookNumbers = await getPhonebookNumbers(phonebookId);
      await sendBulkSMS(phonebookNumbers, message);
    } else {
      return res.status(400).json({ status: false, message: 'Invalid request body. Specify either recipients or phonebookId, not both.' });
    }

    res.status(200).json({ status: true, message: 'SMS sent successfully' });
  } catch (error) {
    console.error('sendSMS error:', error);
    res.status(500).json({ status: false, message: 'Internal server error' });
  }
};

export const getPhonebooks = async (req: Request, res: Response) => {
  try {
    // Extract pagination parameters from the request query
    const { page = '1', pageSize = '10' } = req.query;

    // Convert page and pageSize to numbers
    const pageNumber = parseInt(page as string, 10);
    const pageSizeNumber = parseInt(pageSize as string, 10);

    // Fetch paginated phonebooks
    const phonebooksResult = await fetchPhonebooks(pageNumber, pageSizeNumber);

    // Respond with the paginated result
    res.status(200).json(phonebooksResult);
  } catch (error) {
    console.error('getPhonebooks error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPhonebook = async (req: Request, res: Response) => {
  try {
    const phonebookId = req.params.phonebookId;

    // Fetch paginated phonebooks
    const phonebook = await fetchPhonebook(phonebookId);
    if (!phonebook) {
      return res.status(400).json({ message: 'Phonebook not found' });
    }

    // Respond with the paginated result
    res.status(200).json(phonebook);
  } catch (error) {
    console.error('getPhonebooks error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const uploadPhonebookHandler = async (req: Request, res: Response) => {
  try {
    console.log('Received file:', req.file);
    // Check if file is included in the request
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    await uploadPhonebook(req.file.buffer); // Use req.file.buffer for in-memory storage

    res.status(200).json({ status: true, message: 'Phonebook uploaded successfully' });
  } catch (error) {
    console.error('uploadPhonebookHandler error:', error);
    res.status(500).json({ status: false, message: 'Internal server error' });
  }
};

export const deletePhonebookHandler = async (req: Request, res: Response) => {
  try {
    const phonebookId = req.params.phonebookId;

    const deleted = await deletePhonebook(phonebookId);

    if (deleted) {
      res.status(200).json({ status: true, message: 'Phonebook deleted successfully' });
    } else {
      res.status(400).json({ status: false, message: 'Phonebook not found' });
    }
  } catch (error) {
    console.error('deletePhonebookHandler error:', error);
    res.status(500).json({ status: false, message: 'Internal server error' });
  }
};

export const replacePhonebookHandler = async (req: Request, res: Response) => {
  try {
    const phonebookId = req.params.phonebookId;

    // Check if file is included in the request
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

     // Assuming deletePhonebook is the correct service function
     const deleted = await deletePhonebook(phonebookId);

     if (!deleted) {
      res.status(400).json({ status: false, message: 'Phonebook not found' });
     }else{
      await uploadPhonebook(req.file.buffer);
      res.status(200).json({ status: true, message: 'Phonebook replaced successfully' });
     }
  } catch (error) {
    console.error('replacePhonebookHandler error:', error);
    res.status(500).json({ status: false, message: 'Internal server error' });
  }
};

export const getSMSStatisticsHandler = async (req: Request, res: Response) => {
  try {
    const { days } = req.query;

    // Validate 'days' parameter
    if (![1, 7, 30, 90].includes(Number(days))) {
      return res.status(400).json({ message: 'Invalid value for days. Supported values are 1, 7, 30, or 90.' });
    }

    const statistics = await getSMSStatistics(Number(days));

    res.status(200).json({ statistics });
  } catch (error) {
    console.error('getSMSStatisticsHandler error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

