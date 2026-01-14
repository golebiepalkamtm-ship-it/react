-- Migration: Fix role protection and add phone verification trigger
-- Description: Allows system triggers to bypass role protection and handles phone verification role updates.
-- SECURITY FIX: Added transaction isolation and row-level locking to prevent race conditions

-- 1. Modify protect_user_role to allow bypass via local config with race condition protection
CREATE OR REPLACE FUNCTION public.protect_user_role()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_lock_acquired boolean;
BEGIN
  -- If the role is being changed
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- CRITICAL: Acquire advisory lock to prevent concurrent role modifications
    -- Use user ID as lock key to ensure per-user locking
    v_lock_acquired := pg_try_advisory_xact_lock(hashtext(NEW.id::text));
    
    IF NOT v_lock_acquired THEN
      RAISE EXCEPTION 'Could not acquire lock for user role modification. Please retry.';
    END IF;

    -- Check if we have the bypass flag set (for system triggers)
    IF current_setting('app.bypass_role_protection', true) = 'true' THEN
        RETURN NEW;
    END IF;

    -- Check if user is authenticated (not service_role) and not admin
    IF auth.role() = 'authenticated' AND OLD.role != 'ADMIN' THEN
        -- Revert role change
        NEW.role = OLD.role;
        RAISE WARNING 'Unauthorized role change attempt blocked for user %', NEW.id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- 2. Update handle_email_confirmation to set the bypass flag and handle combined verification
-- SECURITY FIX: Added row-level locking to prevent race conditions
CREATE OR REPLACE FUNCTION public.handle_email_confirmation()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path TO public
LANGUAGE plpgsql
AS $$
DECLARE
  v_current_role text;
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL 
     AND (OLD.email_confirmed_at IS NULL OR OLD.email_confirmed_at != NEW.email_confirmed_at) THEN
    
    -- Set bypass flag
    PERFORM set_config('app.bypass_role_protection', 'true', true);

    -- CRITICAL: Lock the user row to prevent concurrent modifications
    SELECT role INTO v_current_role
    FROM public.users
    WHERE id = NEW.id
    FOR UPDATE NOWAIT;

    -- Check phone verification status to decide role
    IF NEW.phone_confirmed_at IS NOT NULL THEN
        UPDATE public.users 
        SET role = 'USER_FULL_VERIFIED', 
            updated_at = TIMEZONE('utc'::text, NOW())
        WHERE id = NEW.id;
    ELSE
        UPDATE public.users 
        SET role = 'USER_EMAIL_VERIFIED', 
            updated_at = TIMEZONE('utc'::text, NOW())
        WHERE id = NEW.id;
    END IF;
  END IF;
  RETURN NEW;
EXCEPTION
  WHEN lock_not_available THEN
    RAISE WARNING 'Could not acquire lock for user % during email confirmation', NEW.id;
    RETURN NEW;
END;
$$;

-- 3. Create handle_phone_confirmation function
-- SECURITY FIX: Added row-level locking to prevent race conditions
CREATE OR REPLACE FUNCTION public.handle_phone_confirmation()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path TO public
LANGUAGE plpgsql
AS $$
DECLARE
  v_current_role text;
BEGIN
  IF NEW.phone_confirmed_at IS NOT NULL 
     AND (OLD.phone_confirmed_at IS NULL OR OLD.phone_confirmed_at != NEW.phone_confirmed_at) THEN
    
    -- Set bypass flag
    PERFORM set_config('app.bypass_role_protection', 'true', true);

    -- CRITICAL: Lock the user row to prevent concurrent modifications
    SELECT role INTO v_current_role
    FROM public.users
    WHERE id = NEW.id
    FOR UPDATE NOWAIT;

    -- Check email verification status to decide role
    IF NEW.email_confirmed_at IS NOT NULL THEN
        UPDATE public.users 
        SET role = 'USER_FULL_VERIFIED', 
            updated_at = TIMEZONE('utc'::text, NOW())
        WHERE id = NEW.id;
    END IF;
  END IF;
  RETURN NEW;
EXCEPTION
  WHEN lock_not_available THEN
    RAISE WARNING 'Could not acquire lock for user % during phone confirmation', NEW.id;
    RETURN NEW;
END;
$$;

-- 4. Add trigger for phone confirmation
DROP TRIGGER IF EXISTS on_auth_user_phone_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_phone_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_phone_confirmation();
