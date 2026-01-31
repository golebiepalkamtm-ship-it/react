import { z } from 'zod';
import logger from './logger';

// Schema walidacji zmiennych środowiskowych
const envSchema = z.object({
  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().int().positive()).default('8001'),
  
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid PostgreSQL connection string'),
  SHADOW_DATABASE_URL: z.string().url().optional(),
  
  // Supabase
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_ANON_KEY: z.string().min(100, 'SUPABASE_ANON_KEY seems too short'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(100, 'SUPABASE_SERVICE_ROLE_KEY seems too short'),
  SUPABASE_BUCKET: z.string().default('auctions'),
  SUPABASE_BUCKET_PUBLIC: z.string().default('auctions-public'),
  
  // Auth & Security
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('1h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CLIENT_URL: z.string().url('CLIENT_URL must be a valid URL'),
  ALLOWED_ORIGINS: z.string().optional(),
  
  // Twilio (Optional)
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_VERIFY_SERVICE_SID: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  
  // Stripe (Optional)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
});

type EnvSchema = z.infer<typeof envSchema>;

// Walidacja i parsowanie zmiennych środowiskowych
function validateEnv(): EnvSchema {
  try {
    const parsed = envSchema.parse(process.env);
    logger.info('✅ Environment variables validated successfully');
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('❌ Environment validation failed:');
      error.issues.forEach((err: z.ZodIssue) => {
        logger.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      throw new Error('Invalid environment configuration. Check logs above.');
    }
    throw error;
  }
}

// Zgrupowana konfiguracja
export interface AppConfig {
  env: {
    nodeEnv: 'development' | 'production' | 'test';
    port: number;
    isDevelopment: boolean;
    isProduction: boolean;
  };
  db: {
    url: string;
    shadowUrl?: string;
  };
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey: string;
    bucket: string;
    bucketPublic: string;
  };
  auth: {
    jwtSecret: string;
    jwtExpiresIn: string;
    jwtRefreshExpiresIn: string;
  };
  cors: {
    clientUrl: string;
    allowedOrigins: string[];
  };
  twilio: {
    accountSid?: string;
    authToken?: string;
    verifyServiceSid?: string;
    phoneNumber?: string;
    enabled: boolean;
  };
  stripe: {
    secretKey?: string;
    webhookSecret?: string;
    enabled: boolean;
  };
}

// Eksport zgrupowanej konfiguracji
export function createAppConfig(): AppConfig {
  const env = validateEnv();
  
  const allowedOrigins = env.ALLOWED_ORIGINS
    ? env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : [env.CLIENT_URL];
  
  return {
    env: {
      nodeEnv: env.NODE_ENV,
      port: env.PORT,
      isDevelopment: env.NODE_ENV === 'development',
      isProduction: env.NODE_ENV === 'production',
    },
    db: {
      url: env.DATABASE_URL,
      shadowUrl: env.SHADOW_DATABASE_URL,
    },
    supabase: {
      url: env.SUPABASE_URL,
      anonKey: env.SUPABASE_ANON_KEY,
      serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
      bucket: env.SUPABASE_BUCKET,
      bucketPublic: env.SUPABASE_BUCKET_PUBLIC,
    },
    auth: {
      jwtSecret: env.JWT_SECRET,
      jwtExpiresIn: env.JWT_EXPIRES_IN,
      jwtRefreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
    },
    cors: {
      clientUrl: env.CLIENT_URL,
      allowedOrigins,
    },
    twilio: {
      accountSid: env.TWILIO_ACCOUNT_SID,
      authToken: env.TWILIO_AUTH_TOKEN,
      verifyServiceSid: env.TWILIO_VERIFY_SERVICE_SID,
      phoneNumber: env.TWILIO_PHONE_NUMBER,
      enabled: Boolean(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN),
    },
    stripe: {
      secretKey: env.STRIPE_SECRET_KEY,
      webhookSecret: env.STRIPE_WEBHOOK_SECRET,
      enabled: Boolean(env.STRIPE_SECRET_KEY),
    },
  };
}

// Singleton instance
let configInstance: AppConfig | null = null;

export function getConfig(): AppConfig {
  if (!configInstance) {
    configInstance = createAppConfig();
  }
  return configInstance;
}

// Export dla backward compatibility
export const config = getConfig();
