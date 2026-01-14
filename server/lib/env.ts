import { z } from 'zod';

const envSchema = z.object({
  // Środowisko
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().regex(/^\d+$/, 'PORT must be a number').transform(Number).pipe(z.number().min(1).max(65535)).default('8001'),
  CLIENT_URL: z.string().url('CLIENT_URL must be a valid URL'),
  
  // Baza Danych
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  SHADOW_DATABASE_URL: z.string().optional(),
  
  // Supabase
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(200, 'SUPABASE_SERVICE_ROLE_KEY must be a valid service role key'),
  SUPABASE_BUCKET: z.string().min(1, 'SUPABASE_BUCKET is required'),
  SUPABASE_BUCKET_PUBLIC: z.string().min(1, 'SUPABASE_BUCKET_PUBLIC is required'),
  
  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('1h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  
  // Twilio
  TWILIO_ACCOUNT_SID: z.string().min(1, 'TWILIO_ACCOUNT_SID is required'),
  TWILIO_AUTH_TOKEN: z.string().min(1, 'TWILIO_AUTH_TOKEN is required'),
  TWILIO_API_KEY: z.string().min(1, 'TWILIO_API_KEY is required'),
  TWILIO_API_SECRET: z.string().min(1, 'TWILIO_API_SECRET is required'),
  TWILIO_VERIFY_SERVICE_SID: z.string().min(1, 'TWILIO_VERIFY_SERVICE_SID is required'),
  TWILIO_PHONE_NUMBER: z.string().min(1, 'TWILIO_PHONE_NUMBER is required'),
  
  // Stripe
  STRIPE_SECRET_KEY: z.string().min(1, 'STRIPE_SECRET_KEY is required'),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, 'STRIPE_WEBHOOK_SECRET is required'),
  STRIPE_CURRENCY: z.string().default('pln'),
  
  // Security
  ALLOWED_ORIGINS: z.string().optional(),
  CORS_MAX_AGE: z.string().regex(/^\d+$/, 'CORS_MAX_AGE must be a number').transform(Number).pipe(z.number().min(0)).default('86400'),
  RATE_LIMIT_WINDOW_MS: z.string().regex(/^\d+$/, 'RATE_LIMIT_WINDOW_MS must be a number').transform(Number).pipe(z.number().min(1000)).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().regex(/^\d+$/, 'RATE_LIMIT_MAX_REQUESTS must be a number').transform(Number).pipe(z.number().min(1)).default('100'),
  
  // File Upload
  MAX_FILE_SIZE: z.string().regex(/^\d+$/, 'MAX_FILE_SIZE must be a number').transform(Number).pipe(z.number().min(1024)).default('10485760'), // 10MB
  ALLOWED_MIME_TYPES: z.string().default('image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm'),
  
  // Redis (dla rate limiting)
  REDIS_URL: z.string().url('REDIS_URL must be a valid URL').optional(),
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.string().regex(/^\d+$/, 'REDIS_PORT must be a number').transform(Number).pipe(z.number().min(1).max(65535)).optional(),
  REDIS_PASSWORD: z.string().optional(),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error('❌ Environment validation failed:');
  env.error.errors.forEach(err => {
    console.error(`- ${err.message}`);
  });
  process.exit(1);
}

export const validatedEnv = env.data;
