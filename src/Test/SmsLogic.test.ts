import { Request, Response } from 'express';
import {
  sendCode,
  selectGame,
  processGameResults,
  updateBankDetails,
} from "../controllers/sms/sms.controller"

describe('sendCode', () => {
  it('should return products for valid code "START"', async () => {
    const req: Partial<Request> = { body: { code: 'START' } };
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await sendCode(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: true,
      message: expect.any(Array),
    });
  });

  it('should return an error for an invalid code', async () => {
    const req: Partial<Request> = { body: { code: 'INVALID' } };
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await sendCode(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: false,
      message: 'Invalid code. Please send "START" to play the game.',
    });
  });
});

describe('selectGame', () => {
  it('should return a subscription message for a valid game type', async () => {
    const req: Partial<Request> = { body: { gametype: 'P1' } };
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await selectGame(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message:
        'Congratulations, you have subscribed to the daily instant game of N1000. To opt out, send STOP.',
    });
  });

  it('should return an error for an invalid game type', async () => {
    const req: Partial<Request> = { body: { gametype: 'invalidGame' } };
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await selectGame(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid type' });
  });
});

describe('processGameResults', () => {
  it('should return a winning message for a "won" result type', async () => {
    const req: Partial<Request> = { body: { resultType: 'won' } };
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await processGameResults(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message:
        'Congratulations, you have won,To cashout with airtime, send AIRTIME. To cash out with send BANK',
    });
  });

  it('should return a losing message for a "lost" result type', async () => {
    const req: Partial<Request> = { body: { resultType: 'lost' } };
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await processGameResults(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Sorry, you lost. Try again by sending p2',
    });
  });

  it('should return an error for an invalid result type', async () => {
    const req: Partial<Request> = { body: { resultType: 'invalidType' } };
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await processGameResults(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid type' });
  });
});

describe('updateBankDetails', () => {
  it('should update bank details and create a cash-out request', async () => {

    const req: Partial<Request> = {
      body: {
        bankAccount: '123456789',
        bankName: 'Test Bank',
        AccountName: 'Test Account',
        msisdn: '9876543210',
      },
    };
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await updateBankDetails(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Bank details updated successfully',
    });

  });

  it('should not fetch an invalid user', async () => {

    const req: Partial<Request> = {
      body: {
        bankAccount: '123456789',
        bankName: 'Test Bank',
        AccountName: 'Test Account',
        msisdn: '12345',
      },
    };
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await updateBankDetails(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Unable to fetch user.',
    });

  });
});
