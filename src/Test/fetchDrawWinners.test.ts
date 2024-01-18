import { Request, Response } from 'express';
import {
  fetchWinnersForDraw,
} from '../controllers/draw/draw.controller';

import {
  fetchWinnersFromDatabase,
} from '../services/draw.service';

jest.mock('../services/draw.service', () => ({
  fetchSingleDrawFromDatabase: jest.fn(),
  fetchWinnersFromDatabase: jest.fn(),
}));

describe('fetchWinnersForDraw', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return an error if no winners are found for the draw', async () => {
    // Mock the behavior to indicate that no winners are found
    (fetchWinnersFromDatabase as jest.Mock).mockResolvedValue([]);

    const req: Partial<Request> = { params: { drawId: '123' }, query: {} };
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await fetchWinnersForDraw(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400); // Expect a 400 status for not found
    expect(res.json).toHaveBeenCalledWith({ message: 'No winners found for this draw' });
  });

  it('should successfully fetch winners for the draw', async () => {
    // Mock the behavior to return a list of winners
    const mockWinners = [
      {
        id: 'c56650c7-a47b-4099-a2f0-76cc929aa0f5',
        msisdn: '9876543210',
        productId: '0e4bd28c-cf70-45fb-93a7-94c3f45b1943',
        drawId: '4b337e25-7199-41f5-aca9-1f1cf0de6bb4',
        amountWon: 40,
        createdAt: '2023-12-06T23:27:40.930Z',
        updatedAt: '2023-12-06T23:27:40.930Z',
      },
      // Add more winners if needed
    ];

    (fetchWinnersFromDatabase as jest.Mock).mockResolvedValue(mockWinners);

    const req: Partial<Request> = { params: { drawId: '123' }, query: { page: '1', pageSize: '10' } };
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await fetchWinnersForDraw(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200); // Expect a 200 status for success
    expect(res.json).toHaveBeenCalledWith({
      result: {
        records: mockWinners,
        totalRecords: mockWinners.length,
        currentPage: 1,
        pageSize: 10,
        nextPage: null, // Assuming all winners are fetched on a single page
      },
    });
  });
});

  