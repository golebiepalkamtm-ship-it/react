
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking database schema...');
  
  try {
    // 1. Check if column exists
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='bids' AND column_name='display_name';
    `;
    const result = await prisma.$queryRawUnsafe(checkQuery);
    
    if (Array.isArray(result) && result.length > 0) {
      console.log('✅ Column "display_name" already exists in table "bids".');
    } else {
      console.log('⚠️ Column "display_name" MISSING. Adding it now...');
      
      // 2. Add column
      const alterQuery = `
        ALTER TABLE "bids" 
        ADD COLUMN "display_name" TEXT;
      `;
      await prisma.$executeRawUnsafe(alterQuery);
      console.log('✅ Successfully added column "display_name" to table "bids".');
    }

  } catch (e) {
    console.error('❌ Error fixing schema:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
