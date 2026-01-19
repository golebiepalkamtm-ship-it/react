
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking database schema for missing bid columns...');
  
  try {
    const table = 'bids';
    const missingColumns = [];

    // 1. Check is_proxy
    const checkProxy = await prisma.$queryRawUnsafe(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name='${table}' AND column_name='is_proxy';
    `);
    if (!Array.isArray(checkProxy) || checkProxy.length === 0) missingColumns.push('is_proxy');

    // 2. Check max_bid
    const checkMaxBid = await prisma.$queryRawUnsafe(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name='${table}' AND column_name='max_bid';
    `);
    if (!Array.isArray(checkMaxBid) || checkMaxBid.length === 0) missingColumns.push('max_bid');

    if (missingColumns.length === 0) {
      console.log('✅ All columns exist. No changes needed.');
    } else {
      console.log(`⚠️ Missing columns detected: ${missingColumns.join(', ')}. Fixing...`);

      if (missingColumns.includes('is_proxy')) {
        await prisma.$executeRawUnsafe(`ALTER TABLE "${table}" ADD COLUMN "is_proxy" BOOLEAN DEFAULT false;`);
        console.log('  -> Added column "is_proxy"');
      }

      if (missingColumns.includes('max_bid')) {
        await prisma.$executeRawUnsafe(`ALTER TABLE "${table}" ADD COLUMN "max_bid" DECIMAL(12, 2);`);
        console.log('  -> Added column "max_bid"');
      }
      
      console.log('✅ Schema repair complete.');
    }

  } catch (e) {
    console.error('❌ Error fixing schema:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
