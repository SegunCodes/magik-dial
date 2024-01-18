import { Request, Response } from 'express';

const getHelloMessage = (req: Request, res: Response) => {
  try {
    const message = 'Hello, World!';
    res.json({ message });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export { getHelloMessage };
