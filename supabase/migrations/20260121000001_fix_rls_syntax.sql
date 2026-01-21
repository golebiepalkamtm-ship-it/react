-- Fix RLS policies for users table to use standard auth.uid() comparison
-- This prevents potential issues with subqueries in RLS and 406 errors

DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  TO public
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO public
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile"
  ON public.users
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = id);
