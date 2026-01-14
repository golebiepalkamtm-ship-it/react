-- Migration: Unified Role Logic
-- Description: Create shared SQL function for role calculation matching frontend/backend logic

-- Create unified role calculation function
CREATE OR REPLACE FUNCTION public.calculate_user_role(
  user_id UUID,
  current_role TEXT DEFAULT NULL,
  email_confirmed_at TIMESTAMPTZ DEFAULT NULL,
  phone_confirmed_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  -- If DB indicates ADMIN, respect it (no heuristics)
  IF current_role = 'ADMIN' THEN
    RETURN 'ADMIN';
  END IF;
  
  IF current_role = 'USER_FULL_VERIFIED' THEN
    RETURN 'USER_FULL_VERIFIED';
  END IF;

  -- Check verification status
  IF phone_confirmed_at IS NOT NULL AND email_confirmed_at IS NOT NULL THEN
    RETURN 'USER_FULL_VERIFIED';
  END IF;
  
  IF email_confirmed_at IS NOT NULL THEN
    RETURN 'USER_EMAIL_VERIFIED';
  END IF;
  
  RETURN 'USER_REGISTERED';
END;
$$;

-- Update handle_email_confirmation to use unified function
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

    -- Use unified role calculation
    DECLARE
      new_role TEXT;
    BEGIN
      new_role := public.calculate_user_role(
        NEW.id,
        NULL, -- Let function calculate fresh
        NEW.email_confirmed_at,
        NEW.phone_confirmed_at
      );
      
      UPDATE public.users 
      SET role = new_role, 
          updated_at = TIMEZONE('utc'::text, NOW())
      WHERE id = NEW.id;
    END;
  END IF;
  RETURN NEW;
END;
$$;

-- Update handle_phone_confirmation to use unified function
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

    -- Use unified role calculation
    DECLARE
      new_role TEXT;
    BEGIN
      new_role := public.calculate_user_role(
        NEW.id,
        NULL, -- Let function calculate fresh
        NEW.email_confirmed_at,
        NEW.phone_confirmed_at
      );
      
      UPDATE public.users 
      SET role = new_role, 
          updated_at = TIMEZONE('utc'::text, NOW())
      WHERE id = NEW.id;
    END;
  END IF;
  RETURN NEW;
END;
$$;

-- Create view for user roles with verification status (useful for debugging)
CREATE OR REPLACE VIEW public.user_role_verification AS
SELECT 
  u.id,
  u.email,
  u.phone,
  u.role as db_role,
  a.email_confirmed_at,
  a.phone_confirmed_at,
  public.calculate_user_role(
    u.id,
    u.role,
    a.email_confirmed_at,
    a.phone_confirmed_at
  ) as calculated_role,
  CASE 
    WHEN u.role = public.calculate_user_role(u.id, u.role, a.email_confirmed_at, a.phone_confirmed_at) 
    THEN 'SYNCED' 
    ELSE 'DRIFT' 
  END as sync_status
FROM public.users u
LEFT JOIN auth.users a ON u.id = a.id;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.calculate_user_role TO authenticated, service_role;
GRANT SELECT ON public.user_role_verification TO service_role;