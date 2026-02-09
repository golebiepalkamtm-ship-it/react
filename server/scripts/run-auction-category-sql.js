import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DIRECT_URL or DATABASE_URL must be set to run SQL migration.');
  process.exit(1);
}

const pool = new Pool({ connectionString });

async function run() {
  const sqlPath = path.join(__dirname, '../prisma/migrations/20260207_update_auction_category.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  const statements = sql.split(';').map(s => s.trim()).filter(Boolean);

  const client = await pool.connect();
  try {
    console.log('Executing AuctionCategory SQL migration...');
    for (const statement of statements) {
      console.log('> ', statement.substring(0, 100).replace(/\s+/g, ' '), '...');
      await client.query(statement);
    }
    console.log('Migration executed successfully.');
  } catch (err) {
    console.error('Migration error:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

run();
