import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Auto-load env file if DATABASE_URL is not set
if (!process.env.DATABASE_URL && !process.env.DIRECT_URL) {
  try {
    const envServerPath = path.join(__dirname, '../.env');
    if (fs.existsSync(envServerPath)) {
      process.loadEnvFile(envServerPath);
    } else {
      const envRootPath = path.join(__dirname, '../../.env');
      if (fs.existsSync(envRootPath)) {
        process.loadEnvFile(envRootPath);
      }
    }
  } catch (e) {
    // Ignore error
  }
}

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DIRECT_URL or DATABASE_URL must be set in environment or server/.env to run SQL migration.');
  process.exit(1);
}

const pool = new Pool({ connectionString });

async function run() {
  const sqlPath = path.join(__dirname, '../prisma/migrations/20260812110000_fix_supabase_linter_security.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const client = await pool.connect();
  try {
    console.log('Executing Supabase Linter Security Fixes SQL migration...');
    await client.query(sql);
    console.log('✅ Supabase Security Fixes applied successfully!');
  } catch (err) {
    console.error('❌ Migration error:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

run();
