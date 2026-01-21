-- Fix handle_new_user trigger to generate a unique username
-- This prevents duplicate key errors on the unique username constraint

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path TO public
LANGUAGE plpgsql
AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 0;
BEGIN
  -- 1. Generate base username from email or a default
  IF NEW.email IS NOT NULL THEN
    base_username := split_part(NEW.email, '@', 1);
  ELSE
    base_username := 'user';
  END IF;

  -- Sanitize: only alphanumeric and hyphens
  base_username := lower(regexp_replace(base_username, '[^a-zA-Z0-9]+', '-', 'g'));
  base_username := trim(both '-' from base_username);
  
  IF base_username = '' THEN
    base_username := 'user';
  END IF;

  -- 2. Ensure uniqueness by appending random or counter
  final_username := base_username || '-' || substr(NEW.id::text, 1, 4);
  
  -- Check for collisions (rare with 4 chars from UUID, but possible)
  WHILE EXISTS (SELECT 1 FROM public.users WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || '-' || substr(NEW.id::text, 1, 4) || counter;
  END LOOP;

  -- 3. Insert into users table
  INSERT INTO public.users (id, email, role, username, created_at, updated_at)
  VALUES (
    NEW.id, 
    NEW.email, 
    'USER_REGISTERED',
    final_username,
    TIMEZONE('utc'::text, NOW()),
    TIMEZONE('utc'::text, NOW())
  )
  ON CONFLICT (id) DO UPDATE 
    SET email = EXCLUDED.email,
        updated_at = TIMEZONE('utc'::text, NOW());
        
  RETURN NEW;
END;
$$;

-- Fix existing users with empty usernames (if any)
DO $$
DECLARE
  user_record RECORD;
  base_username TEXT;
  final_username TEXT;
  counter INTEGER;
BEGIN
  FOR user_record IN SELECT id, email FROM public.users WHERE username = '' OR username IS NULL LOOP
    IF user_record.email IS NOT NULL THEN
      base_username := split_part(user_record.email, '@', 1);
    ELSE
      base_username := 'user';
    END IF;
    
    base_username := lower(regexp_replace(base_username, '[^a-zA-Z0-9]+', '-', 'g'));
    base_username := trim(both '-' from base_username);
    IF base_username = '' THEN base_username := 'user'; END IF;
    
    final_username := base_username || '-' || substr(user_record.id::text, 1, 4);
    counter := 0;
    
    WHILE EXISTS (SELECT 1 FROM public.users WHERE username = final_username AND id != user_record.id) LOOP
      counter := counter + 1;
      final_username := base_username || '-' || substr(user_record.id::text, 1, 4) || counter;
    END LOOP;
    
    UPDATE public.users SET username = final_username WHERE id = user_record.id;
  END LOOP;
END $$;
