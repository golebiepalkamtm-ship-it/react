-- Fix updated_at constraints and defaults for all major tables
-- Ensures that updated_at is never null and always has a default value

-- 1. Ensure handle_updated_at function is robust
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$;

-- 2. Fix users table
ALTER TABLE public.users 
  ALTER COLUMN updated_at SET DEFAULT TIMEZONE('utc'::text, NOW()),
  ALTER COLUMN updated_at SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT TIMEZONE('utc'::text, NOW()),
  ALTER COLUMN created_at SET NOT NULL;

-- Re-apply trigger to be sure
DROP TRIGGER IF EXISTS set_updated_at ON public.users;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_updated_at();

-- 3. Fix auctions table
ALTER TABLE public.auctions 
  ALTER COLUMN updated_at SET DEFAULT TIMEZONE('utc'::text, NOW()),
  ALTER COLUMN updated_at SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT TIMEZONE('utc'::text, NOW()),
  ALTER COLUMN created_at SET NOT NULL;

DROP TRIGGER IF EXISTS set_updated_at ON public.auctions;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.auctions
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_updated_at();

-- 4. Fix other tables that might have updated_at
-- notifications
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='updated_at') THEN
    ALTER TABLE public.notifications 
      ALTER COLUMN updated_at SET DEFAULT TIMEZONE('utc'::text, NOW()),
      ALTER COLUMN updated_at SET NOT NULL;
    
    DROP TRIGGER IF EXISTS set_updated_at ON public.notifications;
    CREATE TRIGGER set_updated_at
      BEFORE UPDATE ON public.notifications
      FOR EACH ROW 
      EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

-- reviews
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reviews' AND column_name='updated_at') THEN
    ALTER TABLE public.reviews 
      ALTER COLUMN updated_at SET DEFAULT TIMEZONE('utc'::text, NOW()),
      ALTER COLUMN updated_at SET NOT NULL;
    
    DROP TRIGGER IF EXISTS set_updated_at ON public.reviews;
    CREATE TRIGGER set_updated_at
      BEFORE UPDATE ON public.reviews
      FOR EACH ROW 
      EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;
