
import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Prisma Client
// It will pick up the hardcoded URL from schema.prisma if not overridden by env
const prisma = new PrismaClient();

async function main() {
    console.log('Starting RLS security update...');

    try {
        // --- saved_searches ---
        console.log('Processing saved_searches...');
        await prisma.$executeRawUnsafe(`ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;`);
        
        // VIEW
        await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS "Users can view own saved searches" ON public.saved_searches;`);
        await prisma.$executeRawUnsafe(`CREATE POLICY "Users can view own saved searches" ON public.saved_searches FOR SELECT USING (auth.uid() = user_id);`);
        
        // INSERT
        await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS "Users can insert own saved searches" ON public.saved_searches;`);
        await prisma.$executeRawUnsafe(`CREATE POLICY "Users can insert own saved searches" ON public.saved_searches FOR INSERT WITH CHECK (auth.uid() = user_id);`);
        
        // UPDATE
        await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS "Users can update own saved searches" ON public.saved_searches;`);
        await prisma.$executeRawUnsafe(`CREATE POLICY "Users can update own saved searches" ON public.saved_searches FOR UPDATE USING (auth.uid() = user_id);`);
        
        // DELETE
        await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS "Users can delete own saved searches" ON public.saved_searches;`);
        await prisma.$executeRawUnsafe(`CREATE POLICY "Users can delete own saved searches" ON public.saved_searches FOR DELETE USING (auth.uid() = user_id);`);
        
        console.log('✅ saved_searches secured.');

        // --- notifications ---
        console.log('Processing notifications...');
        await prisma.$executeRawUnsafe(`ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;`);
        
        // VIEW
        await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;`);
        await prisma.$executeRawUnsafe(`CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);`);
        
        // UPDATE (Mark as read)
        await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;`);
        await prisma.$executeRawUnsafe(`CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);`);

        // INSERT (Usually system inserts, but maybe user triggers it? Assuming system/trigger for now, but RLS applies to Supabase Client. If system uses Service Key, it bypasses RLS.)
        
        console.log('✅ notifications secured.');

    } catch (e) {
        console.error('❌ Error updating RLS:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
