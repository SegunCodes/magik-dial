import { Request, Response } from 'express';
import { fetchSingleDraw } from '../controllers/draw/draw.controller';
import { fetchSingleDrawFromDatabase } from '../services/draw.service';

jest.mock('../services/draw.service', () => ({
  fetchSingleDrawFromDatabase: jest.fn(),
}));

describe('fetchSingleDraw', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully fetch a single draw', async () => {
    // Mock the behavior of your service function for a successful scenario
    (fetchSingleDrawFromDatabase as jest.Mock).mockResolvedValue({
      // mock single draw data here
      drawId: '123',
      winnersPerPool: 5,
      totalPoolSize: 100,
      // ... other properties
    });

    const req: Partial<Request> = { params: { drawId: '123' } };
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await fetchSingleDraw(req as Request, res as Response);

    // Expect a 200 status for success
    expect(res.status).toHaveBeenCalledWith(200);
    
    // Expect a JSON response with the transformed result
    expect(res.json).toHaveBeenCalledWith({
      result: {
        drawId: '123',
        winnersPerPool: '5', // Assuming winnersPerPool is a number
        totalPoolSize: '100', // Assuming totalPoolSize is a number
        // ... other properties
      },
    });
  });

  it('should return an error if the draw is not found', async () => {
    // Mock the behavior to indicate that the draw is not found
    (fetchSingleDrawFromDatabase as jest.Mock).mockResolvedValue(null);

    const req: Partial<Request> = { params: { drawId: '123' } };
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await fetchSingleDraw(req as Request, res as Response);

    // Expect a 400 status for not found
    expect(res.status).toHaveBeenCalledWith(400);

    // Expect a JSON response indicating the draw is not found
    expect(res.json).toHaveBeenCalledWith({ message: 'Draw not found' });
  });
});