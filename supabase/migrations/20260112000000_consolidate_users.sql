-- Migration: Consolidate users table and cleanup profiles
-- Description: Removes redundant profiles table, ensures users table has all fields, sets up correct triggers and RLS.

-- 1. Drop profiles table and related objects
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_email_confirmed_profile ON auth.users;
DROP FUNCTION IF EXISTS public.handle_auth_user_created_profile();
DROP FUNCTION IF EXISTS public.handle_auth_user_email_confirmation_profile();
DROP TABLE IF EXISTS public.profiles;

-- 2. Ensure users table has all necessary columns (idempotent checks)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='email') THEN
        ALTER TABLE public.users ADD COLUMN email TEXT UNIQUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='role') THEN
        ALTER TABLE public.users ADD COLUMN role TEXT DEFAULT 'USER_REGISTERED';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='created_at') THEN
        ALTER TABLE public.users ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='updated_at') THEN
        ALTER TABLE public.users ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    -- Profile fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='first_name') THEN
        ALTER TABLE public.users ADD COLUMN first_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='last_name') THEN
        ALTER TABLE public.users ADD COLUMN last_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='name') THEN
        ALTER TABLE public.users ADD COLUMN name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='phone') THEN
        ALTER TABLE public.users ADD COLUMN phone TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='avatar_url') THEN
        ALTER TABLE public.users ADD COLUMN avatar_url TEXT;
    END IF;
    -- Address fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='street') THEN
        ALTER TABLE public.users ADD COLUMN street TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='postal_code') THEN
        ALTER TABLE public.users ADD COLUMN postal_code TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='city') THEN
        ALTER TABLE public.users ADD COLUMN city TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='country') THEN
        ALTER TABLE public.users ADD COLUMN country TEXT;
    END IF;
    -- Reputation
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='trust_score') THEN
        ALTER TABLE public.users ADD COLUMN trust_score DECIMAL(3,2) DEFAULT 0.00;
    END IF;
END $$;

-- 3. RLS Policies for users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Remove existing policies to avoid conflicts/duplicates
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.users;
DROP POLICY IF EXISTS "Public can view basic user info" ON public.users;

-- Policy: Owner can view their own full profile
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT
    USING (auth.uid() = id);

-- Policy: Owner can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE
    USING (auth.uid() = id);

-- Policy: Owner can insert their own profile (usually handled by trigger, but useful for edge cases)
CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Policy: Admins can view all profiles (assuming there's a way to identify admins securely, e.g. via app_metadata or checking the role column itself if trusted)
-- For now, let's trust the role column in public.users for simplicity, BUT BEWARE: if a user can update their role, they can become admin.
-- We must ensure 'role' column is NOT updatable by regular users via API.
-- Supabase doesn't support Column Level Privileges in RLS easily. 
-- Best practice: Use a trigger to prevent 'role' change by user, OR use app_metadata.
-- Let's stick to strict owner access for now.

-- 4. Triggers for User Creation and Email Verification

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path TO public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.users (id, email, role, created_at, updated_at)
  VALUES (
    NEW.id, 
    NEW.email, 
    'USER_REGISTERED',
    TIMEZONE('utc'::text, NOW()),
    TIMEZONE('utc'::text, NOW())
  )
  ON CONFLICT (id) DO UPDATE 
    SET email = EXCLUDED.email,
        updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$;

-- Trigger for new auth user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Function for Email Confirmation
CREATE OR REPLACE FUNCTION public.handle_email_confirmation()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path TO public
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL 
     AND (OLD.email_confirmed_at IS NULL OR OLD.email_confirmed_at != NEW.email_confirmed_at) THEN
    -- Update users table, upgrade role if it was USER_REGISTERED
    UPDATE public.users 
    SET role = 'USER_EMAIL_VERIFIED', 
        updated_at = TIMEZONE('utc'::text, NOW())
    WHERE id = NEW.id AND role = 'USER_REGISTERED';
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger for email confirmation
DROP TRIGGER IF EXISTS on_auth_user_email_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_email_confirmation();

-- 5. Helper function for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_updated_at ON public.users;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_updated_at();

-- 6. Prevent users from changing their own role via API
-- This trigger checks if 'role' is being modified by a non-service_role user
CREATE OR REPLACE FUNCTION public.protect_user_role()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
  -- If the role is being changed
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- Allow if it's a trigger-based update (we can't easily detect this, but we can check session role)
    -- Or we can just say: Users cannot update role column via API.
    -- Supabase API uses 'authenticated' role.
    IF auth.role() = 'authenticated' AND OLD.role != 'ADMIN' THEN
        -- Revert role change
        NEW.role = OLD.role;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_protect_user_role ON public.users;
CREATE TRIGGER on_protect_user_role
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_user_role();
