-- Migration: Fix role protection and add phone verification trigger
-- Description: Allows system triggers to bypass role protection and handles phone verification role updates.

-- 1. Modify protect_user_role to allow bypass via local config
CREATE OR REPLACE FUNCTION public.protect_user_role()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
  -- If the role is being changed
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- Check if we have the bypass flag set
    IF current_setting('app.bypass_role_protection', true) = 'true' THEN
        RETURN NEW;
    END IF;

    -- Check if user is authenticated (not service_role) and not admin
    IF auth.role() = 'authenticated' AND OLD.role != 'ADMIN' THEN
        -- Revert role change
        NEW.role = OLD.role;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- 2. Update handle_email_confirmation to set the bypass flag and handle combined verification
CREATE OR REPLACE FUNCTION public.handle_email_confirmation()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path TO public
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL 
     AND (OLD.email_confirmed_at IS NULL OR OLD.email_confirmed_at != NEW.email_confirmed_at) THEN
    
    -- Set bypass flag
    PERFORM set_config('app.bypass_role_protection', 'true', true);

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
END;
$$;

-- 3. Create handle_phone_confirmation function
CREATE OR REPLACE FUNCTION public.handle_phone_confirmation()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path TO public
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.phone_confirmed_at IS NOT NULL 
     AND (OLD.phone_confirmed_at IS NULL OR OLD.phone_confirmed_at != NEW.phone_confirmed_at) THEN
    
    -- Set bypass flag
    PERFORM set_config('app.bypass_role_protection', 'true', true);

    -- Check email verification status to decide role
    IF NEW.email_confirmed_at IS NOT NULL THEN
        UPDATE public.users 
        SET role = 'USER_FULL_VERIFIED', 
            updated_at = TIMEZONE('utc'::text, NOW())
        WHERE id = NEW.id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- 4. Add trigger for phone confirmation
DROP TRIGGER IF EXISTS on_auth_user_phone_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_phone_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_phone_confirmation();
