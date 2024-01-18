import { Request, Response } from 'express';
import { scheduleDraw } from '../controllers/draw/draw.controller';
import {
  getProductAmount,
  getActiveDrawConfig,
  scheduleDrawsDb,
} from '../services/draw.service';

jest.mock('../services/draw.service', () => ({
  getProductAmount: jest.fn(),
  getActiveDrawConfig: jest.fn(),
  scheduleDrawsDb: jest.fn(),
}));

describe('scheduleDraw', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return an error for invalid number of winners', async () => {
    const req: Partial<Request> = {
      body: {
        productId: '123',
        timePeriods: ['2023-01-01 23:59:00', '2023-01-04 06:00:00'],
        numberOfWinners: 0, // Invalid number of winners
      },
    };
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await scheduleDraw(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400); // Expect a 400 status for error
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid number of winners.' });
    expect(scheduleDrawsDb).not.toHaveBeenCalled(); // Ensure scheduleDrawsDb is not called
  });

  it('should return an error if product does not exist', async () => {
    // Mock getProductAmount to indicate that the product does not exist
    (getProductAmount as jest.Mock).mockResolvedValue(false);

    const req: Partial<Request> = {
      body: {
        productId: '123',
        timePeriods: ['2023-01-01 23:59:00', '2023-01-04 06:00:00'],
        numberOfWinners: 3,
      },
    };
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await scheduleDraw(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400); // Expect a 400 status for error
    expect(res.json).toHaveBeenCalledWith({ message: 'Product not found' });
    expect(scheduleDrawsDb).not.toHaveBeenCalled(); // Ensure scheduleDrawsDb is not called
  });

  it('should return an error if there is no active draw configuration', async () => {
    // Mock getProductAmount to indicate that the product exists
    (getProductAmount as jest.Mock).mockResolvedValue(true);

    // Mock getActiveDrawConfig to indicate that there is no active draw configuration
    (getActiveDrawConfig as jest.Mock).mockResolvedValue(null);

    const req: Partial<Request> = {
      body: {
        productId: '123',
        timePeriods: ['2023-01-01 23:59:00', '2023-01-04 06:00:00'],
        numberOfWinners: 3,
      },
    };
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await scheduleDraw(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400); // Expect a 400 status for error
    expect(res.json).toHaveBeenCalledWith({
      message: 'No active draw configuration found for this product.',
    });
    expect(scheduleDrawsDb).not.toHaveBeenCalled(); // Ensure scheduleDrawsDb is not called
  });

  it('should return an error if draw cannot run automatically', async () => {
    // Mock getProductAmount to indicate that the product exists
    (getProductAmount as jest.Mock).mockResolvedValue(true);

    // Mock getActiveDrawConfig to indicate that draw cannot run automatically
    (getActiveDrawConfig as jest.Mock).mockResolvedValue({
      shouldRunAutomatically: false,
    });

    const req: Partial<Request> = {
      body: {
        productId: '123',
        timePeriods: ['2023-01-01 23:59:00', '2023-01-04 06:00:00'],
        numberOfWinners: 3,
      },
    };
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await scheduleDraw(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400); // Expect a 400 status for error
    expect(res.json).toHaveBeenCalledWith({
      message: 'Draw cannot be performed automatically for this product',
    });
    expect(scheduleDrawsDb).not.toHaveBeenCalled(); // Ensure scheduleDrawsDb is not called
  });

});
