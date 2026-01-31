import { validatedEnv } from './env.js';

const parseOrigin = (input?: string | null) => {
  if (!input) return null;
  try {
    return new URL(input).origin;
  } catch {
    return null;
  }
};

const STATIC_CLIENT_ORIGINS = [
  validatedEnv.CLIENT_URL,
  'https://champion-pigeon-web.onrender.com',
  'https://palkamtm.pl',
  'https://www.palkamtm.pl',
  'https://net-pocket.com',
  'https://www.net-pocket.com',
  'https://api.net-pocket.com',
  ...(validatedEnv.ALLOWED_ORIGINS?.split(',').map(origin => origin.trim()) || [])
].filter(Boolean);

const SUPABASE_ORIGINS = [
  parseOrigin(validatedEnv.SUPABASE_URL),
  'https://*.supabase.co',
  'https://*.supabase.in'
].filter(Boolean) as string[];

const STRIPE_ORIGINS = [
  'https://api.stripe.com',
  'https://js.stripe.com',
  'https://m.stripe.network',
  'https://r.stripe.com',
  'https://q.stripe.com',
  'https://hooks.stripe.com',
  'https://checkout.stripe.com'
];

const GOOGLE_AUTH_ORIGINS = [
  'https://accounts.google.com',
  'https://www.google.com',
  'https://www.gstatic.com'
];

const FONT_ORIGINS = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'];

const DEV_HOST_REGEX =
  /^https?:\/\/((localhost|127\.0\.0\.1|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}))(:\d+)?$/i;

const PROD_WILDCARD_PATTERNS = [
  /^https?:\/\/([a-z0-9-]+\.)*onrender\.com$/i,
  /^https?:\/\/([a-z0-9-]+\.)*vercel\.app$/i
];

let cachedOrigins: string[] | null = null;

export const getAllowedOrigins = (): string[] => {
  if (!cachedOrigins) {
    cachedOrigins = Array.from(new Set(STATIC_CLIENT_ORIGINS));
  }
  return cachedOrigins;
};

export const getSupabaseOrigins = () => [...SUPABASE_ORIGINS];
export const getStripeOrigins = () => [...STRIPE_ORIGINS];
export const getGoogleAuthOrigins = () => [...GOOGLE_AUTH_ORIGINS];
export const getFontOrigins = () => [...FONT_ORIGINS];

const isDevOrigin = (origin: string) => validatedEnv.NODE_ENV === 'development' && DEV_HOST_REGEX.test(origin);

const isProdWildcardOrigin = (origin: string) =>
  validatedEnv.NODE_ENV === 'production' && PROD_WILDCARD_PATTERNS.some(pattern => pattern.test(origin));

export const isAllowedOrigin = (origin?: string) => {
  if (!origin) return false;
  if (getAllowedOrigins().includes(origin)) return true;
  return isDevOrigin(origin) || isProdWildcardOrigin(origin);
};

export const isAllowedReferer = (referer?: string) => {
  if (!referer) return false;
  try {
    const refererOrigin = new URL(referer).origin;
    return isAllowedOrigin(refererOrigin);
  } catch {
    return false;
  }
};

export const getCsrfSkipPaths = () => [
  '/api/webhooks/stripe',
  '/api/health',
  '/api/breeder-meetings',
  '/api/upload/image', // Zawężone do konkretnych tras
  '/api/upload/document',
  '/socket.io/'
];

export const getCorsOptions = () => ({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (isAllowedOrigin(origin)) return callback(null, true);
    console.warn(`CORS blocked origin: ${origin}`);
    return callback(new Error('CORS: Origin not allowed'));
  },
  credentials: true,
  maxAge: 86400
});

export const getCsrfAllowedOrigins = () => getAllowedOrigins();
