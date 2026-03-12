import pg from 'pg';

const DATABASE_URL = "postgresql://postgres.nctvwxiqzbedgcmetyal:Milosz.120588@aws-1-eu-west-1.pooler.supabase.com:6543/postgres";

// We'll replace 6543 with 5432 for direct connection to allow DDL
const directUrl = DATABASE_URL.replace(':6543', ':5432').split('?')[0];

async function main() {
  console.log('Connecting to database...');
  const client = new pg.Client({ connectionString: directUrl });
  
  try {
    await client.connect();
    console.log('Connected!');

    console.log('Creating MetricScope Enum...');
    await client.query(`
      DO $$ BEGIN
          CREATE TYPE "MetricScope" AS ENUM ('SITE', 'AUCTION', 'GALLERY_IMAGE');
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;
    `);

    console.log('Creating metrics table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "metrics" (
          "id" UUID NOT NULL DEFAULT gen_random_uuid(),
          "scope" "MetricScope" NOT NULL,
          "target_id" TEXT NOT NULL DEFAULT 'global',
          "count" INTEGER NOT NULL DEFAULT 0,
          "updated_at" TIMESTAMP(3) NOT NULL,
          "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT "metrics_pkey" PRIMARY KEY ("id")
      );
      
      -- Create unique constraint if not exists
      DO $$ BEGIN
        ALTER TABLE "metrics" ADD CONSTRAINT "metrics_scope_target_id_key" UNIQUE ("scope", "target_id");
      EXCEPTION
        WHEN duplicate_table THEN null;
        WHEN duplicate_object THEN null;
        WHEN invalid_table_definition THEN null;
        WHEN others THEN null;
      END $$;
    `);

    console.log('Creating page_views table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "page_views" (
          "id" UUID NOT NULL DEFAULT gen_random_uuid(),
          "path" TEXT NOT NULL,
          "ip_address" TEXT,
          "user_agent" TEXT,
          "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT "page_views_pkey" PRIMARY KEY ("id")
      );
    `);

    console.log('Tables created successfully!');
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

main();