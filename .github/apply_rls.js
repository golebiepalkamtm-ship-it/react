import 'dotenv/config';
import postgres from 'postgres';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const sql = postgres(process.env.DATABASE_URL, {
  ssl: { rejectUnauthorized: false }
});

async function applyRLS() {
  try {
    console.log('Applying RLS policies...');

    // Users table
    await sql`ALTER TABLE public.users ENABLE ROW LEVEL SECURITY`;
    
    // We need to handle potential errors if policies don't exist when dropping, 
    // but DROP POLICY IF EXISTS handles that.
    
    await sql`DROP POLICY IF EXISTS "Users can view own profile" ON public.users`;
    await sql`CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING ((select auth.uid()) = id)`;

    await sql`DROP POLICY IF EXISTS "Users can update own profile" ON public.users`;
    await sql`CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING ((select auth.uid()) = id)`;

    await sql`DROP POLICY IF EXISTS "Users can insert own profile" ON public.users`;
    await sql`CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK ((select auth.uid()) = id)`;

    // Auctions table
    await sql`ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY`;
    
    await sql`DROP POLICY IF EXISTS "Public can view active auctions" ON public.auctions`;
    await sql`CREATE POLICY "Public can view active auctions" ON public.auctions FOR SELECT USING (status = 'ACTIVE' OR (select auth.uid()) = owner_id OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = (select auth.uid()) AND u.role = 'ADMIN'))`;

    await sql`DROP POLICY IF EXISTS "Owners can insert auctions" ON public.auctions`;
    await sql`CREATE POLICY "Owners can insert auctions" ON public.auctions FOR INSERT WITH CHECK ((select auth.uid()) = owner_id)`;

    await sql`DROP POLICY IF EXISTS "Owners can update auctions" ON public.auctions`;
    await sql`CREATE POLICY "Owners can update auctions" ON public.auctions FOR UPDATE USING ((select auth.uid()) = owner_id OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = (select auth.uid()) AND u.role = 'ADMIN'))`;

    await sql`DROP POLICY IF EXISTS "Owners can delete auctions" ON public.auctions`;
    await sql`CREATE POLICY "Owners can delete auctions" ON public.auctions FOR DELETE USING ((select auth.uid()) = owner_id OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = (select auth.uid()) AND u.role = 'ADMIN'))`;

    // Watchlists table
    await sql`ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY`;

    await sql`DROP POLICY IF EXISTS "Users can manage own watchlist" ON public.watchlists`;
    await sql`CREATE POLICY "Users can manage own watchlist" ON public.watchlists FOR ALL USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id)`;

    // Meetings table
    await sql`ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY`;
    
    await sql`DROP POLICY IF EXISTS "Public can view meetings" ON public.meetings`;
    await sql`CREATE POLICY "Public can view meetings" ON public.meetings FOR SELECT USING (true)`;

    await sql`DROP POLICY IF EXISTS "Authenticated users can insert meetings" ON public.meetings`;
    await sql`CREATE POLICY "Authenticated users can insert meetings" ON public.meetings FOR INSERT WITH CHECK ((select auth.uid()) = author_id)`;

    await sql`DROP POLICY IF EXISTS "Authors can update meetings" ON public.meetings`;
    await sql`CREATE POLICY "Authors can update meetings" ON public.meetings FOR UPDATE USING ((select auth.uid()) = author_id)`;

    await sql`DROP POLICY IF EXISTS "Authors can delete meetings" ON public.meetings`;
    await sql`CREATE POLICY "Authors can delete meetings" ON public.meetings FOR DELETE USING ((select auth.uid()) = author_id)`;

    console.log(' RLS policies applied successfully!');

  } catch (err) {
    console.error('Error applying RLS:', err);
  } finally {
    await sql.end();
  }
}

applyRLS();
