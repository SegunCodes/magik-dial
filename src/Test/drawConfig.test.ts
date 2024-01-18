import { Request, Response } from 'express';
import {
  createDrawConfig,
  getDrawConfigs,
  getDrawConfig,
  updateDrawConfig,
} from '../controllers/draw/draw.controller';
import {
  createDrawConfiguration,
  getDrawConfigurations,
  getSingleDrawConfiguration,
  updateDrawConfiguration,
} from '../services/draw.service';

import { DrawConfigType } from '../helpers/enums';

jest.mock('../services/draw.service', () => ({
  createDrawConfiguration: jest.fn(),
  getDrawConfigurations: jest.fn(),
  getSingleDrawConfiguration: jest.fn(),
  updateDrawConfiguration: jest.fn(),
}));

describe('createDrawConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully create a draw configuration', async () => {
    const req: Partial<Request> = {
      body: {
        productId: '123',
        type: DrawConfigType.DAILY, // Provide a valid type
        shouldRunAutomatically: true,
        shouldRunAutomaticallyUntilDate: '2023-01-01 23:59:00', 
        isEnabled: true,
        winnablePercentage: 50,
        winnersPerPool: 3,
        totalPoolSize: 100,
      },
    };
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock the behavior of your service function
    (createDrawConfiguration as jest.Mock).mockResolvedValue({ /* mock draw config data here */ });

    await createDrawConfig(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200); // Expect a 200 status for success
    expect(res.json).toHaveBeenCalledWith(expect.any(Object));
  });

  it('should return an error for an invalid draw configuration type', async () => {
    const req: Partial<Request> = {
      body: {
        productId: '123',
        type: 'InvalidType',
      },
    };
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await createDrawConfig(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400); // Expect a 400 status for invalid type
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid type' });
  });
});

describe('getDrawConfigs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully fetch draw configurations', async () => {
    const req: Partial<Request> = { query: { page: '1', pageSize: '10' } };
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  
    const mockDrawConfigs: any[] = [
      {
        id: '20742418-bceb-45e5-ae0c-4d9e96adf895',
        productId: '0e4bd28c-cf70-45fb-93a7-94c3f45b1943',
        type: 'DAILY',
        shouldRunAutomatically: true,
        shouldRunAutomaticallyUntilDate: '2024-05-01T00:00:00.000Z',
        isEnabled: true,
        winnablePercentage: 20,
        winnersPerPool: 5,
        totalPoolSize: 100,
        createdAt: '2023-12-21T00:05:50.708Z',
        updatedAt: '2023-12-21T00:05:50.708Z',
      },
      // Add more draw configurations if needed
    ];
  
    (getDrawConfigurations as jest.Mock).mockResolvedValue({
      records: mockDrawConfigs,
      totalRecords: mockDrawConfigs.length,
      currentPage: 1,
      pageSize: 10,
    });
  
    await getDrawConfigs(req as Request, res as Response);
  
    expect(res.status).toHaveBeenCalledWith(200); // Expect a 200 status for success
    expect(res.json).toHaveBeenCalledWith({
      records: mockDrawConfigs,
      totalRecords: mockDrawConfigs.length,
      currentPage: 1,
      pageSize: 10,
    });
  });  

  it('should handle no draw configurations found', async () => {
    const req: Partial<Request> = { query: { page: '1', pageSize: '10' } };
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  
    (getDrawConfigurations as jest.Mock).mockResolvedValue({
      records: [],
      totalRecords: 0,
      currentPage: 1,
      pageSize: 10,
    });
  
    await getDrawConfigs(req as Request, res as Response);
  
    expect(res.status).toHaveBeenCalledWith(400); // Expect a 400 status when no draw configurations are found
    expect(res.json).toHaveBeenCalledWith({ message: 'No draw configurations found' });
  });
});


describe('getDrawConfig', () => {
    it('should successfully fetch a draw configuration', async () => {
        const drawConfigId = '18292';
        const req: Partial<Request> = { params: { id: drawConfigId } };
        const res: Partial<Response> = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
    
        // Mock the behavior of your service function
        const mockDrawConfig = { /* Your mock draw configuration here */ };
        (getSingleDrawConfiguration as jest.Mock).mockResolvedValue(mockDrawConfig);
    
        await getDrawConfig(req as Request, res as Response);
    
        expect(res.status).toHaveBeenCalledWith(200); // Expect a 200 status for success
        expect(res.json).toHaveBeenCalledWith(mockDrawConfig);
    });

    it('should return a 400 status if the draw configuration is not found', async () => {
        const drawConfigId = '00019';
        const req: Partial<Request> = { params: { id: drawConfigId } };
        const res: Partial<Response> = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
    
        // Mock the service function to return null (configuration not found)
        (getSingleDrawConfiguration as jest.Mock).mockResolvedValue(null);
    
        await getDrawConfig(req as Request, res as Response);
    
        expect(res.status).toHaveBeenCalledWith(400); // Expect a 400 status when the configuration is not found
        expect(res.json).toHaveBeenCalledWith({ message: 'DrawConfig not found' });
    });
});

describe('updateDrawConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully update a draw configuration', async () => {
    // Mock the behavior of your service functions for a successful scenario
    (getSingleDrawConfiguration as jest.Mock).mockResolvedValue({
      id: '123',
      type: 'weekly',
      shouldRunAutomatically: true,
      shouldRunAutomaticallyUntilDate: '2023-12-31',
      isEnabled: true,
      winnablePercentage: 50,
      winnersPerPool: 3,
      totalPoolSize: 100,
    });
  
    (updateDrawConfiguration as jest.Mock).mockResolvedValue({
      id: '123',
      type: 'weekly',
      shouldRunAutomatically: true,
      shouldRunAutomaticallyUntilDate: '2023-12-31',
      isEnabled: true,
      winnablePercentage: 50,
      winnersPerPool: 3,
      totalPoolSize: 100,
    });
  
    const req: Partial<Request> = {
      params: { id: '123' },
      body: {
        type: 'monthly',
        shouldRunAutomatically: false,
        shouldRunAutomaticallyUntilDate: '2023-11-30',
        isEnabled: false,
        winnablePercentage: 60,
        winnersPerPool: 4,
        totalPoolSize: 150,
      },
    };
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  
    await updateDrawConfig(req as Request, res as Response);
  
    // Expect a 200 status for success
    expect(res.status).toHaveBeenCalledWith(200);
  
    // Expect a JSON response with the transformed result
    expect(res.json).toHaveBeenCalledWith({
      id: '123',
      type: 'weekly', // Expect the updated type here
      shouldRunAutomatically: true, // Expect the updated value here
      shouldRunAutomaticallyUntilDate: '2023-12-31', // Expect the updated value here
      isEnabled: true, // Expect the updated value here
      winnablePercentage: 50,
      winnersPerPool: '3',
      totalPoolSize: '100',
    });
  });
  
  it('should return an error if the draw configuration is not found', async () => {
    // Mock the behavior to indicate that the draw configuration is not found
    (getSingleDrawConfiguration as jest.Mock).mockResolvedValue(null);

    const req: Partial<Request> = {
      params: { id: '123' },
      body: {
        // ... mock data
      },
    };
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await updateDrawConfig(req as Request, res as Response);

    // Expect a 400 status for not found
    expect(res.status).toHaveBeenCalledWith(400);

    // Expect a JSON response indicating the draw configuration is not found
    expect(res.json).toHaveBeenCalledWith({ message: 'DrawConfig not found' });
  });
});
