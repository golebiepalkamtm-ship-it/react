import { Request, Response, NextFunction } from 'express';
import {
  getSupabaseOrigins,
  getStripeOrigins,
  getFontOrigins,
  getGoogleAuthOrigins,
  getAllowedOrigins,
} from '../lib/originUtils.js';

const isDev = process.env.NODE_ENV === 'development';

const vercelLiveOrigin = 'https://vercel.live';

const cspHeader = `
    default-src 'none';
    script-src 'self' ${isDev ? "'unsafe-eval'" : ''} blob: ${vercelLiveOrigin} ${getSupabaseOrigins().join(' ')} ${getGoogleAuthOrigins().join(' ')};
    script-src-elem 'self' ${isDev ? "'unsafe-eval'" : ''} blob: ${vercelLiveOrigin} ${getSupabaseOrigins().join(' ')} ${getGoogleAuthOrigins().join(' ')};
    worker-src 'self' blob: data: ${getSupabaseOrigins().join(' ')};
    style-src 'self' 'unsafe-inline' ${getFontOrigins().join(' ')};
    style-src-elem 'self' 'unsafe-inline' ${getFontOrigins().join(' ')};
    connect-src 'self' ${vercelLiveOrigin} ${getSupabaseOrigins().concat('wss://*.supabase.co').join(' ')} ${getGoogleAuthOrigins().join(' ')} ${getFontOrigins().join(' ')} ${getStripeOrigins().join(' ')} ${getAllowedOrigins().join(' ')};
    img-src 'self' data: https: blob: ${getSupabaseOrigins().join(' ')};
    frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://maps.google.com ${getGoogleAuthOrigins().join(' ')} ${getStripeOrigins().join(' ')};
    font-src 'self' data: https: ${getFontOrigins().join(' ')};
    media-src 'self' data: blob: ${getSupabaseOrigins().join(' ')};
    object-src 'none';
    manifest-src 'self';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
`.replace(/\s+/g, ' ').trim();

export const cspMiddleware = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Content-Security-Policy', cspHeader);
  next();
};
