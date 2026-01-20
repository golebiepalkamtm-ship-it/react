import { z } from 'zod';

// Mock validatedEnv
const validatedEnv = {
  CLIENT_URL: 'https://champion-pigeon-web.onrender.com',
  ALLOWED_ORIGINS: 'https://palkamtm.pl, https://www.palkamtm.pl',
  NODE_ENV: 'production'
};

const allowedOrigins = [
  validatedEnv.CLIENT_URL,
  'https://champion-pigeon-web.onrender.com',
  'https://champion-pigeon-auctions.vercel.app',
  'https://palkamtm.pl',
  'https://www.palkamtm.pl',
  ...(validatedEnv.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [])
].filter(Boolean);

console.log('Allowed Origins:', allowedOrigins);

const isAllowedOrigin = (origin) => {
  if (!origin) return false;
  if (allowedOrigins.includes(origin)) return true;

  // Allow any *.onrender.com frontend hitting the api
  if (/^https?:\/\/([a-z0-9-]+\.)*onrender\.com$/i.test(origin)) return true;

  return false;
};

const testOrigin = 'https://www.palkamtm.pl';
console.log(`Testing origin: ${testOrigin}`);
console.log(`Result: ${isAllowedOrigin(testOrigin)}`);
