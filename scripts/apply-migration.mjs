/**
 * Script to apply the references fix migration directly to Supabase.
 * Uses the DIRECT connection URL (not pooler) for DDL operations.
 */
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Direct connection (not PgBouncer pooler - DDL needs direct connection)
const DATABASE_URL = process.env.DATABASE_URL 
  || "postgresql://postgres.nctvwxiqzbedgcmetyal:Milosz.120588@aws-1-eu-west-1.pooler.supabase.com:6543/postgres";

async function main() {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!');
    
    // Step 0: Check current column names
    console.log('\n📋 Current columns in references table:');
    const colsResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='references'
      ORDER BY ordinal_position;
    `);
    colsResult.rows.forEach(r => console.log(`  • ${r.column_name} (${r.data_type})`));
    
    // Read and execute the migration SQL
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', 
      '20260213180000_fix_references_columns_and_rls.sql');
    
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    
    console.log('\n🚀 Applying migration...');
    await client.query(sql);
    console.log('✅ Migration applied successfully!');
    
    // Verify columns after migration
    console.log('\n📋 Columns after migration:');
    const afterCols = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='references'
      ORDER BY ordinal_position;
    `);
    afterCols.rows.forEach(r => console.log(`  • ${r.column_name} (${r.data_type})`));
    
    // Verify RLS policies
    console.log('\n🔒 Current RLS policies on references:');
    const policies = await client.query(`
      SELECT policyname, cmd, permissive, roles, qual 
      FROM pg_policies 
      WHERE tablename = 'references';
    `);
    policies.rows.forEach(p => {
      console.log(`  • ${p.policyname} [${p.cmd}] roles=${p.roles} permissive=${p.permissive}`);
    });
    
    // Check meetings table too
    console.log('\n📋 Meetings table policies:');
    const meetingPolicies = await client.query(`
      SELECT policyname, cmd, permissive, roles 
      FROM pg_policies 
      WHERE tablename = 'meetings';
    `);
    meetingPolicies.rows.forEach(p => {
      console.log(`  • ${p.policyname} [${p.cmd}] roles=${p.roles}`);
    });
    
    console.log('\n🎉 All done!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.detail) console.error('Detail:', error.detail);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
