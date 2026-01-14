import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { validatedEnv } from './env.js'

// Global interface for Prisma to prevent multiple instances in dev
declare global {
  var prisma: PrismaClient | undefined;
  var prismaPool: Pool | undefined;
}

// Use standard PrismaClient with better error reporting
let prisma: PrismaClient;

const hasDbUrl = !!process.env.DATABASE_URL;

try {
  const prismaOptions: any = {
    log: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['query', 'info', 'warn', 'error'],
  };

  if (!hasDbUrl && process.env.NODE_ENV === 'production') {
    console.error('❌ CRITICAL: DATABASE_URL is not set in environment variables!');
  }

  const shouldUseAdapter = hasDbUrl;

  if (shouldUseAdapter) {
    if (!global.prismaPool) {
      global.prismaPool = new Pool({ connectionString: validatedEnv.DATABASE_URL });
    }
    prismaOptions.adapter = new PrismaPg(global.prismaPool);
  }

  if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient(prismaOptions);
  } else {
    if (!global.prisma) {
      global.prisma = new PrismaClient(prismaOptions);
    }
    prisma = global.prisma;
  }
  console.log('✅ Prisma Client initialized');
} catch (err) {
  console.error('❌ Prisma client initialization failed critical error:', err);
  prisma = new Proxy({} as PrismaClient, {
    get: (_, prop) => {
      throw new Error(`Prisma is not initialized. Database connection is unavailable. Original error: ${err}`);
    }
  });
}

console.log('📡 Database Connection Check:', {
  hasDatabaseUrl: !!validatedEnv.DATABASE_URL,
  nodeEnv: process.env.NODE_ENV,
  prismaInitialized: !!prisma
});

// Use validated environment variables
const { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } = validatedEnv;

// Only create Supabase client if URL and at least one key is provided
let supabase: SupabaseClient | null = null;
const keyToUse = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

if (SUPABASE_URL && keyToUse) {
  supabase = createClient(SUPABASE_URL, keyToUse);
  if (SUPABASE_SERVICE_ROLE_KEY) {
    console.log('✅ Supabase initialized with Service Role Key');
  } else {
    console.log('✅ Supabase initialized with Anon Key');
  }
} else {
  console.warn('Supabase keys missing - Supabase client not initialized');
}

export { prisma, supabase }
