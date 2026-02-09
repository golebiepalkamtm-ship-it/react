import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function runMigration() {
  try {
    const sqlPath = path.join(__dirname, '../prisma/migrations/20260207_update_auction_category.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);

    console.log('Running AuctionCategory enum extension migration...');
    for (const statement of statements) {
      console.log('Executing:', statement.substring(0, 80) + '...');
      await prisma.$executeRawUnsafe(statement);
    }
    console.log('AuctionCategory migration completed successfully.');
  } catch (error) {
    console.error('AuctionCategory migration failed:', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

runMigration();
