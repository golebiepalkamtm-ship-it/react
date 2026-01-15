import 'dotenv/config';
import postgres from 'postgres';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const sql = postgres(process.env.DATABASE_URL, {
  ssl: { rejectUnauthorized: false }
});

async function fixAll() {
  try {
    console.log('Starting DB Repair...');

    // 1. Users table fixes
    console.log('Checking users table...');
    await sql`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username TEXT`;
    // Ensure unique constraint on username if needed, or just index
    // Prisma says @unique.
    try {
        await sql`CREATE UNIQUE INDEX IF NOT EXISTS users_username_key ON public.users(username)`;
    } catch (e) { console.log('Index users_username_key might exist'); }

    // 2. Create missing tables
    console.log('Creating meetings table...');
    await sql`
      CREATE TABLE IF NOT EXISTS public.meetings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        location TEXT,
        date TIMESTAMP(3),
        description TEXT,
        images JSONB DEFAULT '[]',
        author_id UUID NOT NULL,
        created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('Creating watchlists table...');
    await sql`
      CREATE TABLE IF NOT EXISTS public.watchlists (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        auction_id UUID NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
        created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, auction_id)
      )
    `;

    console.log('Creating references table...');
    await sql`
      CREATE TABLE IF NOT EXISTS public.references (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "breederName" TEXT NOT NULL,
        location TEXT NOT NULL,
        rating INTEGER DEFAULT 5,
        opinion TEXT,
        experience TEXT,
        achievements TEXT,
        "pigeonName" TEXT,
        images JSONB DEFAULT '[]',
        "isApproved" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 3. Apply RLS
    console.log('Applying RLS policies...');

    // Users
    await sql`ALTER TABLE public.users ENABLE ROW LEVEL SECURITY`;
    await sql`DROP POLICY IF EXISTS "Users can view own profile" ON public.users`;
    await sql`CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING ((select auth.uid()) = id)`;
    await sql`DROP POLICY IF EXISTS "Users can update own profile" ON public.users`;
    await sql`CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING ((select auth.uid()) = id)`;
    await sql`DROP POLICY IF EXISTS "Users can insert own profile" ON public.users`;
    await sql`CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK ((select auth.uid()) = id)`;

    // Auctions
    await sql`ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY`;
    await sql`DROP POLICY IF EXISTS "Public can view active auctions" ON public.auctions`;
    await sql`CREATE POLICY "Public can view active auctions" ON public.auctions FOR SELECT USING (status = 'ACTIVE' OR (select auth.uid()) = owner_id OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = (select auth.uid()) AND u.role = 'ADMIN'))`;
    await sql`DROP POLICY IF EXISTS "Owners can insert auctions" ON public.auctions`;
    await sql`CREATE POLICY "Owners can insert auctions" ON public.auctions FOR INSERT WITH CHECK ((select auth.uid()) = owner_id)`;
    await sql`DROP POLICY IF EXISTS "Owners can update auctions" ON public.auctions`;
    await sql`CREATE POLICY "Owners can update auctions" ON public.auctions FOR UPDATE USING ((select auth.uid()) = owner_id OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = (select auth.uid()) AND u.role = 'ADMIN'))`;
    await sql`DROP POLICY IF EXISTS "Owners can delete auctions" ON public.auctions`;
    await sql`CREATE POLICY "Owners can delete auctions" ON public.auctions FOR DELETE USING ((select auth.uid()) = owner_id OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = (select auth.uid()) AND u.role = 'ADMIN'))`;

    // Watchlists
    await sql`ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY`;
    await sql`DROP POLICY IF EXISTS "Users can manage own watchlist" ON public.watchlists`;
    await sql`CREATE POLICY "Users can manage own watchlist" ON public.watchlists FOR ALL USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id)`;

    // Meetings
    await sql`ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY`;
    await sql`DROP POLICY IF EXISTS "Public can view meetings" ON public.meetings`;
    await sql`CREATE POLICY "Public can view meetings" ON public.meetings FOR SELECT USING (true)`;
    await sql`DROP POLICY IF EXISTS "Authenticated users can insert meetings" ON public.meetings`;
    await sql`CREATE POLICY "Authenticated users can insert meetings" ON public.meetings FOR INSERT WITH CHECK ((select auth.uid()) = author_id)`;
    await sql`DROP POLICY IF EXISTS "Authors can update meetings" ON public.meetings`;
    await sql`CREATE POLICY "Authors can update meetings" ON public.meetings FOR UPDATE USING ((select auth.uid()) = author_id)`;
    await sql`DROP POLICY IF EXISTS "Authors can delete meetings" ON public.meetings`;
    await sql`CREATE POLICY "Authors can delete meetings" ON public.meetings FOR DELETE USING ((select auth.uid()) = author_id)`;

    // References
    await sql`ALTER TABLE public.references ENABLE ROW LEVEL SECURITY`;
    await sql`DROP POLICY IF EXISTS "Public can view references" ON public.references`;
    await sql`CREATE POLICY "Public can view references" ON public.references FOR SELECT USING (true)`;
    
    // 4. Reload Schema Cache
    console.log('Reloading Supabase schema cache...');
    await sql`NOTIFY pgrst, 'reload schema'`;

    console.log(' All fixes applied successfully!');

  } catch (err) {
    console.error('Error fixing DB:', err);
  } finally {
    await sql.end();
  }
}

fixAll();
