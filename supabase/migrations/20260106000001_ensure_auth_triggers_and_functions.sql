-- Ensure all auth triggers and functions are properly set up
-- This migration ensures the authentication system works correctly

-- ============================================
-- 1. Ensure handle_new_user function exists and is correct
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path TO public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert into users table
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'USER_REGISTERED')
  ON CONFLICT (id) DO UPDATE 
    SET email = EXCLUDED.email,
        updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$;

-- ============================================
-- 2. Ensure handle_email_confirmation function exists and is correct
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_email_confirmation()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path TO public
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL 
     AND (OLD.email_confirmed_at IS NULL OR OLD.email_confirmed_at != NEW.email_confirmed_at) THEN
    -- Update users table
    UPDATE public.users 
    SET role = 'USER_EMAIL_VERIFIED', 
        updated_at = TIMEZONE('utc'::text, NOW())
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

-- ============================================
-- 3. Ensure handle_auth_user_created_profile function exists
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_auth_user_created_profile()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path TO public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (NEW.id, COALESCE(NEW.email, ''), 'USER_REGISTERED')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- ============================================
-- 4. Ensure handle_auth_user_email_confirmation_profile function exists
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_auth_user_email_confirmation_profile()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path TO public
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL 
     AND (OLD.email_confirmed_at IS NULL OR OLD.email_confirmed_at != NEW.email_confirmed_at) THEN
    -- Update profiles table
    UPDATE public.profiles 
    SET role = 'USER_EMAIL_VERIFIED',
        updated_at = TIMEZONE('utc'::text, NOW())
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

-- ============================================
-- 5. Ensure handle_updated_at function exists
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$;

-- ============================================
-- 6. Ensure triggers exist on auth.users
-- ============================================

-- Drop existing triggers if they exist (to avoid duplicates)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_email_confirmed ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_email_confirmed_profile ON auth.users;

-- Create trigger for new user creation (users table)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Create trigger for email confirmation (users table)
CREATE TRIGGER on_auth_user_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_email_confirmation();

-- Create trigger for new user creation (profiles table)
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_auth_user_created_profile();

-- Create trigger for email confirmation (profiles table)
CREATE TRIGGER on_auth_user_email_confirmed_profile
  AFTER UPDATE ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_auth_user_email_confirmation_profile();

-- ============================================
-- 7. Ensure updated_at triggers exist
-- ============================================

-- Users table
DROP TRIGGER IF EXISTS set_updated_at ON public.users;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_updated_at();

-- Profiles table
DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 8. Add helpful comments
-- ============================================

COMMENT ON FUNCTION public.handle_new_user() IS 'Creates a user profile in public.users when a new auth user is created';
COMMENT ON FUNCTION public.handle_email_confirmation() IS 'Updates user role to USER_EMAIL_VERIFIED when email is confirmed';
COMMENT ON FUNCTION public.handle_auth_user_created_profile() IS 'Creates a profile in public.profiles when a new auth user is created';
COMMENT ON FUNCTION public.handle_auth_user_email_confirmation_profile() IS 'Updates profile role to USER_EMAIL_VERIFIED when email is confirmed';
COMMENT ON FUNCTION public.handle_updated_at() IS 'Automatically updates updated_at timestamp on row update';

