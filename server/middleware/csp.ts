import { Request, Response, NextFunction } from 'express';
import { getSupabaseOrigins, getStripeOrigins, getFontOrigins, getGoogleAuthOrigins } from '../lib/originUtils.js';

const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' blob: ${getSupabaseOrigins().join(' ')} ${getGoogleAuthOrigins().join(' ')};
    script-src-elem 'self' 'unsafe-eval' blob: ${getSupabaseOrigins().join(' ')} ${getGoogleAuthOrigins().join(' ')};
    worker-src 'self' blob: data: ${getSupabaseOrigins().join(' ')};
    style-src 'self' 'unsafe-inline' ${getFontOrigins().join(' ')};
    style-src-elem 'self' 'unsafe-inline' ${getFontOrigins().join(' ')};
    connect-src 'self' ${getSupabaseOrigins().concat('wss://*.supabase.co').join(' ')} ${getGoogleAuthOrigins().join(' ')} ${getFontOrigins().join(' ')} ${getStripeOrigins().join(' ')};
    img-src 'self' data: https: blob: ${getSupabaseOrigins().join(' ')};
    frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://maps.google.com ${getGoogleAuthOrigins().join(' ')} ${getStripeOrigins().join(' ')};
    font-src 'self' data: https: ${getFontOrigins().join(' ')};
    object-src 'none';
    base-uri 'self';
    form-action 'self';
`.replace(/\s+/g, ' ').trim();

export const cspMiddleware = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Content-Security-Policy', cspHeader);
  next();
};
