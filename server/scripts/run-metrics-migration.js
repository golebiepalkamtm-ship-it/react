import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function runMigration() {
  try {
    const sqlPath = path.join(__dirname, '../prisma/migrations/create_metrics_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Split SQL into individual statements
    const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);

    console.log('Running metrics table migration...');
    for (const statement of statements) {
      console.log('Executing:', statement.substring(0, 50) + '...');
      await prisma.$executeRawUnsafe(statement);
    }
    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runMigration();
