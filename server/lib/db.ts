import 'dotenv/config'
import type { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

// Lazily initialize Prisma with the Postgres adapter for Supabase
let prisma: PrismaClient | null = null
try {
  // Import adapter and client dynamically to avoid startup errors when prisma client
  // hasn't been generated yet during development.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { PrismaPg } = require('@prisma/adapter-pg')
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { PrismaClient } = require('@prisma/client')
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  prisma = new PrismaClient({ adapter })
} catch (err) {
  // If Prisma isn't ready or DATABASE_URL missing, degrade gracefully.
  // Other modules in the server should check for `prisma` being null.
  // eslint-disable-next-line no-console
  console.warn('Prisma client not initialized:', err)
  prisma = null
}

// Initialize Supabase client for server-side usage (service role recommended)
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(
  SUPABASE_URL ?? '',
  SUPABASE_SERVICE_ROLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? ''
)

export { prisma, supabase }
