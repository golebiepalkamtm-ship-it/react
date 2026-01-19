
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

// Patch DATABASE_URL for PgBouncer compatibility
if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('pgbouncer=true')) {
  const separator = process.env.DATABASE_URL.includes('?') ? '&' : '?';
  process.env.DATABASE_URL = `${process.env.DATABASE_URL}${separator}pgbouncer=true`;
  console.log('🔧 Patched DATABASE_URL with pgbouncer=true');
}

const prisma = new PrismaClient();

async function main() {
  console.log('🛠️ Starting Schema Repair V3 (Missing Tables & Columns)...');

  try {
    // 1. Create table: saved_searches
    console.log('➡️ Creating table "saved_searches"...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "saved_searches" (
        "id" UUID NOT NULL DEFAULT gen_random_uuid(),
        "user_id" UUID NOT NULL,
        "name" TEXT NOT NULL,
        "filters" JSONB NOT NULL,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "saved_searches_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "saved_searches_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    // Add indexes for saved_searches
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "saved_searches_user_id_idx" ON "saved_searches"("user_id");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "saved_searches_is_active_idx" ON "saved_searches"("is_active");`);
    console.log('✅ Created "saved_searches"');


    // 2. Create table: notifications
    console.log('➡️ Creating table "notifications"...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "notifications" (
        "id" UUID NOT NULL DEFAULT gen_random_uuid(),
        "user_id" UUID NOT NULL,
        "auction_id" UUID,
        "type" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "read" BOOLEAN NOT NULL DEFAULT false,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "notifications_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "notifications_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "auctions"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    // Add indexes for notifications
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "notifications_user_id_idx" ON "notifications"("user_id");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "notifications_auction_id_idx" ON "notifications"("auction_id");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "notifications_read_idx" ON "notifications"("read");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "notifications_type_idx" ON "notifications"("type");`);
    console.log('✅ Created "notifications"');


    // 3. Create table: reviews
    console.log('➡️ Creating table "reviews"...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "reviews" (
        "id" UUID NOT NULL DEFAULT gen_random_uuid(),
        "auction_id" UUID NOT NULL,
        "reviewer_id" UUID NOT NULL,
        "reviewee_id" UUID NOT NULL,
        "rating" INTEGER NOT NULL,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "reviews_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "reviews_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "auctions"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "reviews_reviewee_id_fkey" FOREIGN KEY ("reviewee_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    // Add indexes for reviews
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "reviews_auction_id_reviewer_id_key" ON "reviews"("auction_id", "reviewer_id");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "reviews_auction_id_idx" ON "reviews"("auction_id");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "reviews_reviewer_id_idx" ON "reviews"("reviewer_id");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "reviews_reviewee_id_idx" ON "reviews"("reviewee_id");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "reviews_rating_idx" ON "reviews"("rating");`);
    console.log('✅ Created "reviews"');


    // 4. Add missing column to payments: raw_response
    console.log('➡️ Adding column "raw_response" to "payments"...');
    // Check if exists first to be safe (idempotent)
    const checkPaymentCol = await prisma.$queryRawUnsafe(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name='payments' AND column_name='raw_response';
    `);
    
    if (Array.isArray(checkPaymentCol) && checkPaymentCol.length === 0) {
       await prisma.$executeRawUnsafe(`ALTER TABLE "payments" ADD COLUMN "raw_response" JSONB;`);
       console.log('✅ Added column "raw_response"');
    } else {
       console.log('ℹ️ Column "raw_response" already exists.');
    }

    console.log('\n✨ All repairs completed successfully!');

  } catch (e) {
    console.error('❌ Error repairing schema:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
