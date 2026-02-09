-- Fix RLS policies for users table to resolve 403 Forbidden errors
-- This migration drops conflicting policies and establishes a clear public-read/owner-write model

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
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 5. No INSERT policy needed (User creation is handled by Supabase Auth triggers)
-- If explicit INSERT is needed for admins, uncomment below:
-- CREATE POLICY "Admins can insert users" ON public.users FOR INSERT WITH CHECK (public.is_admin());
