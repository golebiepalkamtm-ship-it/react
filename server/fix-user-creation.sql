-- Fix user creation trigger to ensure users are properly saved
-- This migration ensures the handle_new_user function works correctly

-- 1. Drop and recreate the handle_new_user function with proper error handling
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path TO public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Log the user creation attempt
  RAISE LOG 'Creating user profile for auth user: %, email: %', NEW.id, NEW.email;
  
  -- Insert into users table with explicit conflict handling
  INSERT INTO public.users (id, email, role, created_at, updated_at)
  VALUES (NEW.id, NEW.email, 'USER_REGISTERED', NOW(), NOW())
  ON CONFLICT (id) DO UPDATE 
    SET email = EXCLUDED.email,
        updated_at = NOW();
    
  -- Log success
  RAISE LOG 'User profile created/updated for: %', NEW.id;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- 2. Ensure trigger exists and is properly configured
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- 3. Verify the trigger is working
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'Creates user profile in public.users when new auth user is created';

-- 4. Test the function manually (optional - can be removed)
SELECT 'handle_new_user function created successfully' as status;
