import { Request, Response, NextFunction } from 'express';

const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.supabase.co https://accounts.google.com;
    worker-src 'self' blob:;
    style-src 'self' 'unsafe-inline';
    connect-src 'self' * https://*.supabase.co wss://*.supabase.co https://accounts.google.com;
`.replace(/\s+/g, ' ').trim();

export const cspMiddleware = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Content-Security-Policy', cspHeader);
  next();
};