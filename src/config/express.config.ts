export {};

declare global {
  namespace Express {
    interface Request {
      adminId: string;
    }
  }
}
