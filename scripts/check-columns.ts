
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

// Patch DATABASE_URL for PgBouncer compatibility
if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('pgbouncer=true')) {
  const separator = process.env.DATABASE_URL.includes('?') ? '&' : '?';
  process.env.DATABASE_URL = `${process.env.DATABASE_URL}${separator}pgbouncer=true`;
}

const prisma = new PrismaClient();

// Definition of what we expect in the DB based on schema.prisma
const expectedSchema: Record<string, string[]> = {
  saved_searches: ['id', 'user_id', 'name', 'filters', 'is_active', 'created_at', 'updated_at'],
  users: [
    'id', 'email', 'username', 'name', 'phone', 'first_name', 'last_name',
    'street', 'postal_code', 'city', 'country', 'is_blocked', 'is_banned',
    'blocked_until', 'banned_until', 'trust_score', 'role', 'avatar_url',
    'created_at', 'updated_at'
  ],
  auctions: [
    'id', 'title', 'description', 'starting_price', 'current_price', 'buy_now_price',
    'reserve_price', 'ends_at', 'starts_at', 'snipe_threshold_minutes',
    'snipe_extension_minutes', 'min_bid_increment', 'status', 'reserve_met',
    'category', 'sex', 'location', 'age', 'created_at', 'updated_at',
    'winner_id', 'final_price', 'end_date', 'pigeon_id', 'owner_id'
  ],
  pigeon_profiles: [
    'id', 'auction_id', 'ringnumber', 'eye_color', 'feather_color',
    'construction', 'vitality', 'length', 'endurance', 'fork_strength',
    'fork_alignment', 'muscles', 'balance', 'back', 'purpose', 'gender',
    'created_at', 'updated_at'
  ],
  auction_images: ['id', 'auction_id', 'url', 'ordering', 'created_at'],
  auction_videos: ['id', 'auction_id', 'url', 'created_at'],
  auction_documents: ['id', 'auction_id', 'url', 'created_at'],
  bids: [
    'id', 'auction_id', 'bidder_id', 'display_name', 'amount',
    'is_proxy', 'max_bid', 'created_at'
  ],
  watchlists: ['id', 'user_id', 'auction_id', 'created_at'],
  notifications: [
    'id', 'user_id', 'auction_id', 'type', 'title', 'message',
    'read', 'created_at', 'updated_at'
  ],
  reviews: [
    'id', 'auction_id', 'reviewer_id', 'reviewee_id', 'rating',
    'created_at', 'updated_at'
  ],
  meetings: [
    'id', 'name', 'location', 'date', 'description', 'images',
    'author_id', 'created_at', 'updated_at'
  ],
  payments: [
    'id', 'auction_id', 'user_id', 'amount', 'provider', 'type',
    'status', 'external_id', 'approval_url', 'raw_response',
    'created_at', 'updated_at'
  ],
  references: [
    'id', 'breederName', 'location', 'rating', 'opinion', 'experience',
    'achievements', 'pigeonName', 'images', 'isApproved',
    'createdAt', 'updatedAt'
  ]
};

async function main() {
  console.log('🔍 Starting comprehensive database schema verification...');
  let hasErrors = false;

  try {
    // Get all tables and columns from the database
    const dbColumns = await prisma.$queryRawUnsafe<Array<{ table_name: string, column_name: string }>>(`
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public';
    `);

    // Organize DB columns by table
    const dbStructure: Record<string, Set<string>> = {};
    for (const row of dbColumns) {
      if (!dbStructure[row.table_name]) {
        dbStructure[row.table_name] = new Set();
      }
      dbStructure[row.table_name].add(row.column_name);
    }

    // Verify each expected table
    for (const [tableName, expectedCols] of Object.entries(expectedSchema)) {
      if (!dbStructure[tableName]) {
        console.error(`❌ MISSING TABLE: "${tableName}"`);
        hasErrors = true;
        continue;
      }

      const existingCols = dbStructure[tableName];
      const missingCols = expectedCols.filter(col => !existingCols.has(col));

      if (missingCols.length > 0) {
        console.error(`❌ TABLE "${tableName}" is missing columns: ${missingCols.join(', ')}`);
        hasErrors = true;
      } else {
        console.log(`✅ TABLE "${tableName}": OK (${expectedCols.length} columns verified)`);
      }
    }

    if (!hasErrors) {
      console.log('\n✨ SUCCESS: Database structure matches the expected schema!');
    } else {
      console.log('\n⚠️ FOUND DISCREPANCIES. Please review the errors above.');
    }

  } catch (e) {
    console.error('CRITICAL ERROR during verification:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
