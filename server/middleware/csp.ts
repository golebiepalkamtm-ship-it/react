import { Request, Response, NextFunction } from 'express';

const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' blob: https://*.supabase.co https://accounts.google.com https://www.google.com https://www.gstatic.com;
    script-src-elem 'self' 'unsafe-eval' blob: https://*.supabase.co https://accounts.google.com https://www.google.com https://www.gstatic.com;
    worker-src 'self' blob: data: https://*.supabase.co;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com;
    style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com;
    connect-src 'self' https://*.supabase.co wss://*.supabase.co https://accounts.google.com https://www.google.com https://fonts.googleapis.com https://fonts.gstatic.com;
    img-src 'self' data: https: blob: https://*.supabase.co;
    frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://maps.google.com https://www.google.com https://accounts.google.com;
    font-src 'self' data: https: https://fonts.gstatic.com https://fonts.googleapis.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
`.replace(/\s+/g, ' ').trim();

export const cspMiddleware = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Content-Security-Policy', cspHeader);
  next();
};
