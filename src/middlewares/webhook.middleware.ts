import { Request, Response, NextFunction } from 'express';

export const verifyOrigin = (req: Request, res: Response, next: NextFunction) => {
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://example.com,http://yourdomain.com').split(','); // Use a default value if ALLOWED_ORIGINS is not set
    const origin = req.get('origin') || '';
    const enableMiddleware = process.env.ENABLE_VERIFY_MIDDLEWARE === 'true';

    if (enableMiddleware) {
        if (allowedOrigins.includes(origin)) {
            next();
        } else {
            res.status(403).json({ message: 'Unauthorized origin' });
        }
    } else {
        // If middleware is disabled, simply pass control to the next middleware
        next();
    }
};