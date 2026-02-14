-- Migration: Fix Users Table Permissions for Backend Role Check
-- Problem: GET /users?select=role returns 403 Forbidden even with service_role key
-- Solution: Ensure explicit SELECT grants and clear RLS policies
-- 1. Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- 2. Drop all possibly conflicting policies
DROP POLICY IF EXISTS "Users are viewable by everyone" ON public.users;
DROP POLICY IF EXISTS "Users can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.users;
DROP POLICY IF EXISTS "Enable all users for users table" ON public.users;
-- 3. Create a clean, permissive SELECT policy
-- This allows anyone to read basic user info (needed for bidder lists, profiles, etc.)
CREATE POLICY "Users Select Policy" ON public.users FOR
SELECT USING (true);
-- 4. Grant SELECT permission explicitly to all roles
-- In some Supabase versions, RLS is bypassable but table-level permissions are still required
GRANT SELECT ON public.users TO anon,
    authenticated,
    service_role;
-- 5. Ensure the authenticator can use the schema (usually already set, but being explicit doesn't hurt)
GRANT USAGE ON SCHEMA public TO anon,
    authenticated,
    service_role;
-- 6. Add policy for service_role to be safe, even though it should bypass RLS
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'users'
        AND policyname = 'service_role_all_users'
) THEN CREATE POLICY "service_role_all_users" ON public.users FOR ALL TO service_role USING (true) WITH CHECK (true);
END IF;
END $$;