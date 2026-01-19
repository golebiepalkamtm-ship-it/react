-- Migration: Secure RLS and Roles
-- Description: Enable RLS, remove naive admin check, secure role column

-- 1. Enable RLS on all sensitive tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing insecure policies (if any remain)
DROP POLICY IF EXISTS "Enable all users for users table" ON public.users;
DROP POLICY IF EXISTS "Enable all users for auctions table" ON public.auctions;
DROP POLICY IF EXISTS "Enable all users for bids table" ON public.bids;
DROP POLICY IF EXISTS "Enable all users for watchlist table" ON public.watchlist;
DROP POLICY IF EXISTS "Enable all users for payments table" ON public.payments;

-- 3. USERS Table Policies
-- Allow public read of basic user info (needed for seller profiles etc)
-- Note: In a real app you might want to hide email/phone from public view using a view or separate table
-- For now, we allow select for all to keep app working, but we secure updates.
CREATE POLICY "Users are viewable by everyone" 
ON public.users FOR SELECT 
USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
ON public.users FOR UPDATE 
USING (auth.uid() = id);

-- Prevent users from inserting (creation handled by trigger)
-- No INSERT policy needed (default deny)

-- 4. AUCTIONS Table Policies
CREATE POLICY "Auctions are viewable by everyone" 
ON public.auctions FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create auctions" 
ON public.auctions FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own auctions" 
ON public.auctions FOR UPDATE 
USING (auth.uid() = owner_id); -- Note: Schema says sellerId/owner_id map. Check schema.
-- Schema check: sellerId String? @map("owner_id"). So DB column is owner_id.

CREATE POLICY "Users can delete own auctions" 
ON public.auctions FOR DELETE 
USING (auth.uid() = owner_id);

-- 5. BIDS Table Policies
CREATE POLICY "Bids are viewable by everyone" 
ON public.bids FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can place bids" 
ON public.bids FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- 6. WATCHLIST Table Policies
CREATE POLICY "Users can view own watchlist" 
ON public.watchlist FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own watchlist" 
ON public.watchlist FOR ALL 
USING (auth.uid() = user_id);

-- 7. REVIEWS Table Policies
CREATE POLICY "Reviews are viewable by everyone" 
ON public.reviews FOR SELECT 
USING (true);

CREATE POLICY "Users can create reviews" 
ON public.reviews FOR INSERT 
WITH CHECK (auth.uid() = reviewer_id);

-- 8. PROTECT ROLE COLUMN
-- Create a trigger function that prevents non-admins from changing their role
CREATE OR REPLACE FUNCTION public.protect_role_change()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If role is changing
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- Allow if current user is service_role or admin (you can implement admin check if you have a way to identify them in session)
    -- For now, strict: Only service_role (triggers/dashboard) can change role.
    -- Standard users (authenticated) cannot change role.
    -- We can check current_setting('role') or auth.jwt()
    
    IF (auth.jwt() ->> 'role') = 'service_role' THEN
       RETURN NEW;
    END IF;
    
    -- Allow internal triggers (when bypass is set)
    IF current_setting('app.bypass_role_protection', true) = 'true' THEN
      RETURN NEW;
    END IF;

    RAISE EXCEPTION 'You cannot change your own role.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_role_update ON public.users;
CREATE TRIGGER protect_role_update
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_role_change();

-- 9. FIX calculate_user_role FUNCTION (Remove naive admin check)
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
  -- If DB indicates ADMIN, respect it.
  IF current_role = 'ADMIN' THEN
    RETURN 'ADMIN';
  END IF;
  
  -- Logic matches TypeScript:
  -- Full verification
  IF phone_confirmed_at IS NOT NULL AND email_confirmed_at IS NOT NULL THEN
    RETURN 'USER_FULL_VERIFIED';
  END IF;
  
  -- Email verified only
  IF email_confirmed_at IS NOT NULL THEN
    RETURN 'USER_EMAIL_VERIFIED';
  END IF;
  
  -- Default
  RETURN 'USER_REGISTERED';
END;
$$;
