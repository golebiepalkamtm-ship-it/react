import { validatedEnv } from './env.js';

const parseOrigin = (input?: string | null) => {
  if (!input) return null;
  try {
    return new URL(input).origin;
  } catch {
    return null;
  }
};

const normalizeOrigin = (raw?: string | null) => {
  if (!raw) return null;
  const trimmed = raw.trim().replace(/^["'`]|["'`]$/g, '').replace(/\/+$/, '');
  const parsed = parseOrigin(trimmed);
  if (parsed) return parsed;
  return trimmed || null;
};

const STATIC_CLIENT_ORIGINS = [
  validatedEnv.CLIENT_URL,
  'https://champion-pigeon-web.onrender.com',
  'https://palkamtm.pl',
  'https://www.palkamtm.pl',
  'https://server-production-0e43.up.railway.app',
  'https://net-pocket.com',
  'https://www.net-pocket.com',
  'https://api.net-pocket.com',
  'https://react-e4y0fh2w4-marcins-projects-59088b6e.vercel.app',
  'https://react-ctuurojfy-marcins-projects-59088b6e.vercel.app',
  'https://react-j4jocvs37-marcins-projects-59088b6e.vercel.app',
  ...(validatedEnv.ALLOWED_ORIGINS ? validatedEnv.ALLOWED_ORIGINS.split(',').map(normalizeOrigin) : [])
].map(normalizeOrigin).filter(Boolean) as string[];

const SUPABASE_ORIGINS = [
  parseOrigin(validatedEnv.SUPABASE_URL),
  'https://*.supabase.co',
  'https://*.supabase.in',
  'https://nctvwxiqzbedgcmetyal.storage.supabase.co'
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

const PROD_WILDCARD_PATTERNS: RegExp[] = [
  /^https:\/\/react-.*-marcins-projects-59088b6e\.vercel\.app$/
]; // Wildcards allowed for Vercel previews


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

const isDevOrigin = (origin: string) => {
  const norm = normalizeOrigin(origin);
  return !!(norm && DEV_HOST_REGEX.test(norm));
};

const isProdWildcardOrigin = (origin: string) =>
  validatedEnv.NODE_ENV === 'production' && PROD_WILDCARD_PATTERNS.some(pattern => pattern.test(origin));

export const isAllowedOrigin = (origin?: string, allowedOrigins: string[] = getAllowedOrigins()) => {
  // Allow requests with no origin (mobile apps, curl, etc.)
  if (!origin) return true;
  const normalized = normalizeOrigin(origin);
  if (normalized && normalized === normalizeOrigin(validatedEnv.CLIENT_URL)) return true; // Allow self
  if (normalized && allowedOrigins.includes(normalized)) return true;
  return isDevOrigin(origin) || isProdWildcardOrigin(origin);
};

export const isAllowedReferer = (referer?: string) => {
  if (!referer) return false;
  try {
    const refererOrigin = new URL(referer).origin;
    const normalized = normalizeOrigin(refererOrigin);
    return normalized && isAllowedOrigin(normalized);
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
    // Treat unknown/missing origin as allowed for same-origin / server-to-server requests
    if (isAllowedOrigin(origin)) return callback(null, true);
    console.warn(`CORS blocked origin: ${origin}`);
    // Do NOT surface an error to Express (causes 500) — instead indicate "not allowed"
    // so the request proceeds but without CORS response headers (tests expect 200 + no ACAO).
    return callback(null, false);
  },
  credentials: true,
  maxAge: 86400
});

export const getCsrfAllowedOrigins = () => getAllowedOrigins();
