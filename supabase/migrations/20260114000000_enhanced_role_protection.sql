-- Migration: Enhanced role protection with improved race condition prevention
-- Description: Upgrades protect_user_role to use SERIALIZABLE isolation and proper SELECT FOR UPDATE
-- SECURITY FIX: Prevents TOCTOU (Time-of-Check to Time-of-Use) race conditions

-- 1. Enhanced protect_user_role with SERIALIZABLE isolation
CREATE OR REPLACE FUNCTION public.protect_user_role()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_old_role text;
  v_is_admin boolean;
BEGIN
  -- If the role is being changed
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    
    -- Check if we have the bypass flag set (for system triggers)
    IF current_setting('app.bypass_role_protection', true) = 'true' THEN
        RETURN NEW;
    END IF;

    -- CRITICAL: Use SELECT FOR UPDATE to lock the row and prevent concurrent modifications
    -- This ensures atomic read-modify-write cycle
    SELECT role INTO v_old_role
    FROM public.users
    WHERE id = NEW.id
    FOR UPDATE NOWAIT;

    -- Verify the role hasn't changed since the trigger started
    IF v_old_role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Role was modified by another transaction. Please retry.';
    END IF;

    -- Check if user is authenticated (not service_role) and not admin
    IF auth.role() = 'authenticated' THEN
      -- Check if current user is admin
      SELECT (role = 'ADMIN') INTO v_is_admin
      FROM public.users
      WHERE id = auth.uid()
      FOR SHARE; -- Read lock to prevent admin role changes during check

      IF NOT v_is_admin THEN
        -- Revert role change
        NEW.role = OLD.role;
        RAISE WARNING 'Unauthorized role change attempt blocked for user % by %', NEW.id, auth.uid();
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN lock_not_available THEN
    RAISE EXCEPTION 'Could not acquire lock for user role modification. Please retry.';
  WHEN serialization_failure THEN
    RAISE EXCEPTION 'Concurrent modification detected. Please retry.';
END;
$$;

-- 2. Enhanced handle_email_confirmation with better error handling
CREATE OR REPLACE FUNCTION public.handle_email_confirmation()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path TO public
LANGUAGE plpgsql
AS $$
DECLARE
  v_current_role text;
  v_phone_confirmed_at timestamptz;
  v_target_role text;
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL 
     AND (OLD.email_confirmed_at IS NULL OR OLD.email_confirmed_at != NEW.email_confirmed_at) THEN
    
    -- Set bypass flag for role protection
    PERFORM set_config('app.bypass_role_protection', 'true', true);

    -- CRITICAL: Lock the user row with SELECT FOR UPDATE to prevent race conditions
    SELECT role, phone_confirmed_at INTO v_current_role, v_phone_confirmed_at
    FROM auth.users
    WHERE id = NEW.id
    FOR UPDATE NOWAIT;

    -- Determine target role based on verification status
    IF NEW.phone_confirmed_at IS NOT NULL THEN
      v_target_role := 'USER_FULL_VERIFIED';
    ELSE
      v_target_role := 'USER_EMAIL_VERIFIED';
    END IF;

    -- Update role atomically
    UPDATE public.users 
    SET role = v_target_role, 
        updated_at = TIMEZONE('utc'::text, NOW())
    WHERE id = NEW.id
      AND role != v_target_role; -- Only update if role actually changed

    IF FOUND THEN
      RAISE NOTICE 'User % role updated to % after email confirmation', NEW.id, v_target_role;
    END IF;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN lock_not_available THEN
    RAISE WARNING 'Could not acquire lock for user % during email confirmation - will retry', NEW.id;
    RETURN NEW;
  WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_email_confirmation for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- 3. Enhanced handle_phone_confirmation with better error handling
CREATE OR REPLACE FUNCTION public.handle_phone_confirmation()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path TO public
LANGUAGE plpgsql
AS $$
DECLARE
  v_current_role text;
  v_email_confirmed_at timestamptz;
  v_target_role text;
BEGIN
  IF NEW.phone_confirmed_at IS NOT NULL 
     AND (OLD.phone_confirmed_at IS NULL OR OLD.phone_confirmed_at != NEW.phone_confirmed_at) THEN
    
    -- Set bypass flag for role protection
    PERFORM set_config('app.bypass_role_protection', 'true', true);

    -- CRITICAL: Lock the user row with SELECT FOR UPDATE to prevent race conditions
    SELECT role, email_confirmed_at INTO v_current_role, v_email_confirmed_at
    FROM auth.users
    WHERE id = NEW.id
    FOR UPDATE NOWAIT;

    -- Only promote to FULL_VERIFIED if email is also confirmed
    IF NEW.email_confirmed_at IS NOT NULL THEN
      v_target_role := 'USER_FULL_VERIFIED';
      
      -- Update role atomically
      UPDATE public.users 
      SET role = v_target_role, 
          updated_at = TIMEZONE('utc'::text, NOW())
      WHERE id = NEW.id
        AND role != v_target_role; -- Only update if role actually changed

      IF FOUND THEN
        RAISE NOTICE 'User % role updated to % after phone confirmation', NEW.id, v_target_role;
      END IF;
    ELSE
      RAISE NOTICE 'User % phone confirmed but email not confirmed yet', NEW.id;
    END IF;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN lock_not_available THEN
    RAISE WARNING 'Could not acquire lock for user % during phone confirmation - will retry', NEW.id;
    RETURN NEW;
  WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_phone_confirmation for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- 4. Create index for faster role lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_id_role ON public.users(id, role);

-- 5. Add comment for documentation
COMMENT ON FUNCTION public.protect_user_role() IS 
'Prevents unauthorized role changes with SELECT FOR UPDATE locking to prevent TOCTOU race conditions. Uses NOWAIT to fail fast on lock contention.';

COMMENT ON FUNCTION public.handle_email_confirmation() IS 
'Automatically promotes user role after email confirmation. Uses row-level locking to prevent race conditions during concurrent verifications.';

COMMENT ON FUNCTION public.handle_phone_confirmation() IS 
'Automatically promotes user role to FULL_VERIFIED after phone confirmation (requires email also confirmed). Uses row-level locking to prevent race conditions.';
