import { z } from 'zod';

const envSchema = z.object({
  // Środowisko
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().regex(/^\d+$/, 'PORT must be a number').transform(Number).pipe(z.number().min(1).max(65535)).default('8001'),
  CLIENT_URL: z.string().url('CLIENT_URL must be a valid URL').default('http://localhost:5173'),
  
  // Baza Danych
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_URL: z.string().url('DIRECT_URL must be a valid URL').optional(),
  SHADOW_DATABASE_URL: z.string().optional(),
  
  // Supabase
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  SUPABASE_BUCKET: z.string().min(1, 'SUPABASE_BUCKET is required'),
  SUPABASE_BUCKET_PUBLIC: z.string().min(1, 'SUPABASE_BUCKET_PUBLIC is required'),
  
  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('1h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  
  // Twilio
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_API_KEY: z.string().optional(),
  TWILIO_API_SECRET: z.string().optional(),
  TWILIO_VERIFY_SERVICE_SID: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  
  // Stripe (opcjonalne - do płatności)
  STRIPE_SECRET_KEY: z.string().optional().default(''),
  STRIPE_WEBHOOK_SECRET: z.string().optional().default(''),
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
    console.error(`- ${err.path.join('.')}: ${err.message}`);
  });
  process.exit(1);
}

// CRITICAL: Additional production security checks
if (env.data.NODE_ENV === 'production') {
  const criticalSecrets = [
    'JWT_SECRET',
    'SUPABASE_SERVICE_ROLE_KEY',
    'DATABASE_URL'
  ] as const;

  const missingSecrets: string[] = [];
  
  for (const secret of criticalSecrets) {
    const value = env.data[secret];
    if (!value || value.length < 10) {
      missingSecrets.push(secret);
    }
  }

  if (missingSecrets.length > 0) {
    console.error('❌ CRITICAL SECURITY ERROR: Missing or invalid secrets in production:');
    missingSecrets.forEach(secret => {
      console.error(`  - ${secret}`);
    });
    console.error('\n🔒 All secrets must be properly configured in production environment.');
    process.exit(1);
  }

  // Verify no default/weak values
  const weakPatterns = [
    /^(test|dev|demo|example|change[-_]?me|secret|password|12345)/i,
    /^.{1,15}$/  // Too short for production
  ];

  const weakSecrets: string[] = [];
  
  for (const secret of criticalSecrets) {
    const value = env.data[secret] as string;
    if (weakPatterns.some(pattern => pattern.test(value))) {
      weakSecrets.push(secret);
    }
  }

  if (weakSecrets.length > 0) {
    console.error('❌ CRITICAL SECURITY ERROR: Weak or default secrets detected in production:');
    weakSecrets.forEach(secret => {
      console.error(`  - ${secret} appears to use a weak or default value`);
    });
    console.error('\n🔒 All secrets must be strong and unique in production.');
    process.exit(1);
  }

  console.log('✅ Production security validation passed');
}

export const validatedEnv = env.data;
