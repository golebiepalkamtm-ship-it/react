import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { validatedEnv } from './env.js'

// Global interface for Prisma to prevent multiple instances in dev
declare global {
  var prisma: PrismaClient | undefined;
}

// Use standard PrismaClient without adapter to avoid DATABASE_URL issues
let prisma: PrismaClient;

const hasDbUrl = !!process.env.DATABASE_URL;

try {
  const adapter = validatedEnv.DIRECT_URL ? new PrismaPg({ connectionString: validatedEnv.DIRECT_URL }) : undefined;

  const prismaOptions: any = {
    adapter,
    log: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['query', 'info', 'warn', 'error'],
  };

  if (!hasDbUrl && process.env.NODE_ENV === 'production') {
    console.error('❌ CRITICAL: DATABASE_URL is not set in environment variables!');
  }

  // Auto-patch DATABASE_URL to use Supabase connection pooling (port 6543) if not already set.
  // This is crucial for serverless/cloud environments like Render to prevent connection exhaustion.
  // Supabase provides two ports: 5432 (Session/Direct) and 6543 (Transaction/Pooler).
  // For production apps, we should prefer 6543 with pgbouncer=true.
  if (process.env.DATABASE_URL) {
    const url = process.env.DATABASE_URL;
    
    // Check if we are using the direct port 5432 and try to switch to 6543 for pooling if possible
    // (This is a heuristic, verify with your specific Supabase setup)
    if (url.includes(':5432') && !url.includes('pgbouncer=true')) {
       console.log('⚠️ Detected direct DB connection (port 5432). Recommendation: Use port 6543 for pooling in production.');
    }

    // Ensure pgbouncer=true is set if we are on the pooler port or if explicitly needed
    // However, recent Prisma versions handle this better. 
    // We will re-enable the patch ONLY if we are sure it's missing and causing issues, 
    // but based on logs, the issue is "type AuctionCategory does not exist", which is a MIGRATION/SCHEMA sync issue, not connection.
    // So we leave the patch commented out for now.
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
  databaseUrlLength: validatedEnv.DATABASE_URL?.length || 0,
  databaseUrlPreview: validatedEnv.DATABASE_URL?.substring(0, 30) + '...',
  nodeEnv: process.env.NODE_ENV,
  prismaInitialized: !!prisma
});

// Fail-fast in production if DATABASE_URL is missing
if (process.env.NODE_ENV === 'production' && !validatedEnv.DATABASE_URL) {
  console.error('❌ CRITICAL: DATABASE_URL is required in production but not provided');
  process.exit(1);
}

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
