
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

// Patch DATABASE_URL for PgBouncer compatibility
if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('pgbouncer=true')) {
  const separator = process.env.DATABASE_URL.includes('?') ? '&' : '?';
  process.env.DATABASE_URL = `${process.env.DATABASE_URL}${separator}pgbouncer=true`;
}

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Starting database operations verification...');

  try {
    // 1. Count users
    console.log('Checking users table...');
    const userCount = await prisma.user.count(); // Note: Model name is 'User' (singular) in Prisma Client usually, though mapped to 'users'
    console.log(`✅ Users count: ${userCount}`);

    // 2. Count auctions
    console.log('Checking auctions table...');
    const auctionCount = await prisma.auction.count();
    console.log(`✅ Auctions count: ${auctionCount}`);

    // 3. Simple query with relation (if auctions exist)
    if (auctionCount > 0) {
      console.log('Fetching one auction with relations...');
      const auction = await prisma.auction.findFirst({
        include: {
          bids: true,
          pigeon: true
        }
      });
      console.log(`✅ Fetched auction: "${auction?.title}" (ID: ${auction?.id})`);
      console.log(`   - Bids: ${auction?.bids.length}`);
      console.log(`   - Pigeon Profile: ${auction?.pigeon ? 'Found' : 'Missing'}`);
    } else {
      console.log('ℹ️ No auctions to test relations.');
    }

     // 4. Check system roles/users
    console.log('Checking for admin users...');
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      take: 5
    });
    console.log(`✅ Found ${admins.length} admins.`);

    // 5. Check existence of critical database functions
    console.log('Checking critical database functions...');
    const functionNames = ['handle_new_user', 'handle_email_confirmation', 'handle_updated_at'];
    
    // Use information_schema which is more portable and standard
    const dbFunctions = await prisma.$queryRawUnsafe<Array<{ routine_name: string }>>(`
      SELECT routine_name 
      FROM information_schema.routines 
      WHERE routine_schema = 'public' 
      AND routine_name IN (${functionNames.map(n => `'${n}'`).join(', ')});
    `);
    
    const foundFunctions = dbFunctions.map(f => f.routine_name);
    const missingFunctions = functionNames.filter(n => !foundFunctions.includes(n));
    
    if (missingFunctions.length === 0) {
      console.log(`✅ All critical DB functions found: ${foundFunctions.join(', ')}`);
    } else {
      console.warn(`⚠️ Missing DB functions (might be issue with permissions or migrations): ${missingFunctions.join(', ')}`);
      // Try listing all public functions to debug
       const allFunctions = await prisma.$queryRawUnsafe<Array<{ routine_name: string }>>(`
        SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' LIMIT 10;
      `);
      console.log('Sample public functions found:', allFunctions.map(f => f.routine_name).join(', '));
    }

    console.log('\n✨ SUCCESS: Basic DB operations are working!');

  } catch (e) {
    console.error('❌ CRITICAL ERROR during operations check:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
