import { Request, Response } from 'express';
import { performInstantDraw } from '../controllers/draw/draw.controller';
import * as drawController from '../controllers/draw/draw.controller';

// Mock the entire draw controller module to provide mock functions, including executeDrawLogic
jest.mock('../controllers/draw/draw.controller', () => ({
  ...jest.requireActual('../controllers/draw/draw.controller'),
  executeDrawLogic: jest.fn(),
}));

describe('performInstantDraw', () => {
    it('should return product not found', async () => {
        const productId = '123';
        const numberOfWinners = 3; 
        // Mock the behavior of the executeDrawLogic function
        (drawController.executeDrawLogic as jest.Mock).mockResolvedValueOnce({
          status: 'success',
          message: 'Winners selected:'
        });
    
        const req: Partial<Request> = { params: { productId }, body: { numberOfWinners } };
        const res: Partial<Response> = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    
        await performInstantDraw(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(400); 
        expect(res.json).toHaveBeenCalledWith({ message: 'Product not found' });
    });
    

    it('should return an error for an invalid number of winners', async () => {
        const productId = '123';
        const numberOfWinners = 0; 

        // Mock the executeDrawLogic function to return an error status
        (drawController.executeDrawLogic as jest.Mock).mockResolvedValue({
            status: 'error',
            message: 'Invalid number of winners.',
        });

        const req: Partial<Request> = { params: { productId }, body: { numberOfWinners } };
        const res: Partial<Response> = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await performInstantDraw(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(400); // Expect a 400 status for error
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid number of winners.' });
    });

    it('should return an error for No active draw configuration found for this product', async () => {
        const productId = '9ff40c80-2294-465b-a025-7959c1d9fcab';
        const numberOfWinners = 5; 

        // Mock the executeDrawLogic function to return an error status
        (drawController.executeDrawLogic as jest.Mock).mockResolvedValue({
            status: 'error',
            message: 'No active draw configuration found for this product.',
        });

        const req: Partial<Request> = { params: { productId }, body: { numberOfWinners } };
        const res: Partial<Response> = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await performInstantDraw(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(400); // Expect a 400 status for error
        expect(res.json).toHaveBeenCalledWith({ message: 'No active draw configuration found for this product.' });
    });
});
