const { Client } = require('pg');

const conn = 'postgresql://postgres.nctvwxiqzbedgcmetyal:Milosz.120588@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1';

(async () => {
  const c = new Client({ connectionString: conn });
  try {
    await c.connect();
    console.log('Connected to database.');

    // Execute the SQL to fix RLS policies
    const sql = `
      -- 1. Ensure RLS is enabled
      ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

      -- 2. Drop all known existing policies on users table to avoid conflicts
      DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
      DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
      DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
      DROP POLICY IF EXISTS "Enable all users for users table" ON public.users;
      DROP POLICY IF EXISTS "Users are viewable by everyone" ON public.users;
      DROP POLICY IF EXISTS "Users can select self" ON public.users;
      DROP POLICY IF EXISTS "Users can update self" ON public.users;
      DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.users;

      -- 3. Create permissive SELECT policy (Profiles are public)
      CREATE POLICY "Users are viewable by everyone" 
      ON public.users FOR SELECT 
      USING (true);

      -- 4. Create restrictive UPDATE policy (Only owner can update their profile)
      CREATE POLICY "Users can update own profile" 
      ON public.users FOR UPDATE 
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
    `;

    await c.query(sql);
    console.log('RLS policies updated successfully.');

    // Verify policies
    const pol = await c.query(`select policyname, cmd, permissive, roles from pg_policies where schemaname='public' and tablename='users';`);
    console.log('Current policies:', pol.rows);

  } catch (err) {
    console.error('Error executing script:', err);
  } finally {
    await c.end();
  }
})();
