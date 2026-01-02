
/* FILE: setup_security.sql */

-- supabase/migrations/setup_security.sql

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  phone TEXT,
  name TEXT,
  role TEXT DEFAULT 'USER_REGISTERED' CHECK (role IN ('USER_REGISTERED', 'USER_EMAIL_VERIFIED', 'USER_FULL_VERIFIED', 'ADMIN')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'USER_REGISTERED');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to handle email confirmation
CREATE OR REPLACE FUNCTION public.handle_email_confirmation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND (OLD.email_confirmed_at IS NULL OR OLD.email_confirmed_at != NEW.email_confirmed_at) THEN
    UPDATE public.users SET role = 'USER_EMAIL_VERIFIED' WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for email confirmation
CREATE TRIGGER on_auth_user_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_email_confirmation();

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

/* FILE: create_auctions_bids_watchlist.sql */

-- supabase/migrations/create_auctions_bids_watchlist.sql
-- Schema-first migration: auctions, bids, watchlists with RLS and indexes

-- Auctions table
CREATE TABLE IF NOT EXISTS public.auctions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  starting_price numeric(12,2) DEFAULT 0 NOT NULL,
  current_price numeric(12,2) DEFAULT 0 NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','open','closed','cancelled')),
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;

-- Policies: public can view auctions
CREATE POLICY "Public can select auctions" ON public.auctions
  FOR SELECT USING (true);

-- Owners or admins can insert auctions (owner_id must match auth.uid())
CREATE POLICY "Owners can insert auctions" ON public.auctions
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Owners or admins can update/delete their auctions
CREATE POLICY "Owners can update auctions" ON public.auctions
  FOR UPDATE USING (auth.uid() = owner_id OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'ADMIN'));

CREATE POLICY "Owners can delete auctions" ON public.auctions
  FOR DELETE USING (auth.uid() = owner_id OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'ADMIN'));

CREATE INDEX IF NOT EXISTS idx_auctions_owner_id ON public.auctions(owner_id);
CREATE INDEX IF NOT EXISTS idx_auctions_status ON public.auctions(status);

-- Bids table
CREATE TABLE IF NOT EXISTS public.bids (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  auction_id UUID REFERENCES public.auctions(id) ON DELETE CASCADE,
  bidder_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  display_name TEXT,
  amount numeric(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- Policies: allow public select for bids related to public auctions
CREATE POLICY "Public can select bids for auctions" ON public.bids
  FOR SELECT USING (true);

-- Authenticated user can insert a bid if bidder_id == auth.uid()
CREATE POLICY "Users can insert own bids" ON public.bids
  FOR INSERT WITH CHECK (auth.uid() = bidder_id);

-- Users can update/delete only their bids (or admin)
CREATE POLICY "Users can update bids" ON public.bids
  FOR UPDATE USING (auth.uid() = bidder_id OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'ADMIN'));

CREATE POLICY "Users can delete bids" ON public.bids
  FOR DELETE USING (auth.uid() = bidder_id OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'ADMIN'));

CREATE INDEX IF NOT EXISTS idx_bids_auction_id ON public.bids(auction_id);
CREATE INDEX IF NOT EXISTS idx_bids_bidder_id ON public.bids(bidder_id);

-- Watchlist table
CREATE TABLE IF NOT EXISTS public.watchlists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  auction_id UUID REFERENCES public.auctions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE (user_id, auction_id)
);

ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own watchlist" ON public.watchlists
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_watchlists_user_id ON public.watchlists(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlists_auction_id ON public.watchlists(auction_id);

-- Ensure updated_at is set on update using shared function if exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_updated_at') THEN
    EXECUTE 'CREATE TRIGGER set_updated_at_auctions BEFORE UPDATE ON public.auctions FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();';
  END IF;
END$$;

ALTER TABLE IF EXISTS public.auctions
  ADD COLUMN IF NOT EXISTS buy_now_price numeric(12,2),
  ADD COLUMN IF NOT EXISTS reserve_price numeric(12,2),
  ADD COLUMN IF NOT EXISTS reserve_met boolean DEFAULT true NOT NULL,
  ADD COLUMN IF NOT EXISTS snipe_threshold_minutes integer DEFAULT 2 NOT NULL,
  ADD COLUMN IF NOT EXISTS snipe_extension_minutes integer DEFAULT 2 NOT NULL,
  ADD COLUMN IF NOT EXISTS min_bid_increment numeric(12,2) DEFAULT 100 NOT NULL,
  ADD COLUMN IF NOT EXISTS category text DEFAULT 'racing' NOT NULL,
  ADD COLUMN IF NOT EXISTS pigeon jsonb DEFAULT '{}'::jsonb NOT NULL,
  ADD COLUMN IF NOT EXISTS age integer DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS sex text DEFAULT 'male' NOT NULL,
  ADD COLUMN IF NOT EXISTS location text DEFAULT '' NOT NULL,
  ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]'::jsonb NOT NULL,
  ADD COLUMN IF NOT EXISTS videos jsonb DEFAULT '[]'::jsonb NOT NULL,
  ADD COLUMN IF NOT EXISTS documents jsonb DEFAULT '[]'::jsonb NOT NULL;

CREATE OR REPLACE FUNCTION public.place_bid_atomic(
  p_auction_id uuid,
  p_bidder_id uuid,
  p_amount numeric,
  p_display_name text DEFAULT NULL
)
RETURNS TABLE (
  bid_id uuid,
  auction_id uuid,
  bidder_id uuid,
  amount numeric,
  created_at timestamptz,
  new_price numeric,
  was_extended boolean,
  new_ends_at timestamptz,
  reserve_met boolean
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_current_price numeric;
  v_min_increment numeric;
  v_status text;
  v_ends_at timestamptz;
  v_threshold_minutes integer;
  v_extension_minutes integer;
  v_reserve_price numeric;
  v_reserve_met boolean;
  v_now timestamptz := now();
BEGIN
  SELECT
    a.current_price,
    COALESCE(a.min_bid_increment, 100),
    a.status,
    a.ends_at,
    COALESCE(a.snipe_threshold_minutes, 2),
    COALESCE(a.snipe_extension_minutes, 2),
    a.reserve_price
  INTO
    v_current_price,
    v_min_increment,
    v_status,
    v_ends_at,
    v_threshold_minutes,
    v_extension_minutes,
    v_reserve_price
  FROM public.auctions a
  WHERE a.id = p_auction_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Auction not found' USING ERRCODE = 'P0002';
  END IF;

  IF v_status <> 'open' THEN
    RAISE EXCEPTION 'Auction is not active' USING ERRCODE = 'P0001';
  END IF;

  IF v_ends_at IS NOT NULL AND v_ends_at <= v_now THEN
    UPDATE public.auctions SET status = 'closed' WHERE id = p_auction_id;
    RAISE EXCEPTION 'Auction is not active' USING ERRCODE = 'P0001';
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Invalid bid amount' USING ERRCODE = '22023';
  END IF;

  IF p_amount < (v_current_price + v_min_increment) THEN
    RAISE EXCEPTION 'Bid must be at least %', (v_current_price + v_min_increment) USING ERRCODE = '22023';
  END IF;

  was_extended := false;
  new_ends_at := v_ends_at;

  IF v_ends_at IS NOT NULL THEN
    IF (v_ends_at - v_now) <= make_interval(mins => v_threshold_minutes) THEN
      new_ends_at := v_ends_at + make_interval(mins => v_extension_minutes);
      was_extended := true;
    END IF;
  END IF;

  v_reserve_met := CASE
    WHEN v_reserve_price IS NULL THEN true
    ELSE p_amount >= v_reserve_price
  END;

  INSERT INTO public.bids (auction_id, bidder_id, amount, display_name)
  VALUES (p_auction_id, p_bidder_id, p_amount, NULLIF(BTRIM(p_display_name), ''))
  RETURNING id, auction_id, bidder_id, amount, created_at
  INTO bid_id, auction_id, bidder_id, amount, created_at;

  UPDATE public.auctions
  SET
    current_price = p_amount,
    ends_at = new_ends_at,
    reserve_met = v_reserve_met,
    updated_at = TIMEZONE('utc'::text, NOW())
  WHERE id = p_auction_id;

  new_price := p_amount;
  reserve_met := v_reserve_met;
  RETURN NEXT;
END;
$$;

CREATE OR REPLACE FUNCTION public.close_expired_auctions()
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  v_updated integer;
BEGIN
  UPDATE public.auctions
  SET status = 'closed', updated_at = TIMEZONE('utc'::text, NOW())
  WHERE status = 'open' AND ends_at IS NOT NULL AND ends_at <= NOW();

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END;
$$;

CREATE OR REPLACE VIEW public.active_auctions_summary AS
SELECT
  a.*,
  COALESCE(bids_agg.bids_count, 0) AS bids_count,
  COALESCE(watch_agg.watchlist_count, 0) AS watchlist_count,
  bids_agg.highest_bid
FROM public.auctions a
LEFT JOIN (
  SELECT
    b.auction_id,
    COUNT(*)::integer AS bids_count,
    MAX(b.amount) AS highest_bid
  FROM public.bids b
  GROUP BY b.auction_id
) bids_agg ON bids_agg.auction_id = a.id
LEFT JOIN (
  SELECT
    w.auction_id,
    COUNT(*)::integer AS watchlist_count
  FROM public.watchlists w
  GROUP BY w.auction_id
) watch_agg ON watch_agg.auction_id = a.id
WHERE a.status = 'open' AND (a.ends_at IS NULL OR a.ends_at > NOW());

/* FILE: add_address_fields.sql */

-- supabase/migrations/add_address_fields.sql

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS street TEXT,
  ADD COLUMN IF NOT EXISTS postal_code TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS is_blocked boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS blocked_until TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS banned_until TIMESTAMP WITH TIME ZONE;

/* FILE: create_profiles_sync.sql */

-- supabase/migrations/create_profiles_sync.sql
-- Create profiles table and sync with auth.users via triggers

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT,
  bio TEXT,
  role TEXT DEFAULT 'USER_REGISTERED' CHECK (role IN ('USER_REGISTERED','USER_EMAIL_VERIFIED','USER_FULL_VERIFIED','ADMIN')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies: users can view own profile; admins can view all
CREATE POLICY "Profiles: users can view own profile or admin" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'ADMIN'));

-- Users can update only their profile
CREATE POLICY "Profiles: users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert (on auth.user creation) only matching id
CREATE POLICY "Profiles: insert for new users" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can delete own profile (or admin)
CREATE POLICY "Profiles: delete own or admin" ON public.profiles
  FOR DELETE USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'ADMIN'));

-- Function to create profile when auth.user created
CREATE OR REPLACE FUNCTION public.handle_auth_user_created_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (NEW.id, NEW.email, 'USER_REGISTERED')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to fire after insert on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_auth_user_created_profile();

-- Function to handle email confirmation and update role
CREATE OR REPLACE FUNCTION public.handle_auth_user_email_confirmation_profile()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND (OLD.email_confirmed_at IS NULL OR OLD.email_confirmed_at != NEW.email_confirmed_at) THEN
    UPDATE public.profiles SET role = 'USER_EMAIL_VERIFIED' WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for updates on auth.users
DROP TRIGGER IF EXISTS on_auth_user_email_confirmed_profile ON auth.users;
CREATE TRIGGER on_auth_user_email_confirmed_profile
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_auth_user_email_confirmation_profile();

-- Use existing handle_updated_at trigger if present
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_updated_at') THEN
    EXECUTE 'CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();';
  END IF;
END$$;

/* FILE: 20251230_place_bid_atomic_v2.sql */

-- Wrap in a single DO block so the CLI executes one statement, avoiding the prepared-statement multi-command error.
DO $$
BEGIN
  EXECUTE $fn$
  CREATE OR REPLACE FUNCTION public.place_bid_atomic(
    p_auction_id uuid,
    p_bidder_id uuid,
    p_amount numeric,
    p_display_name text DEFAULT NULL
  )
  RETURNS TABLE (
    bid_id uuid,
    auction_id uuid,
    bidder_id uuid,
    amount numeric,
    created_at timestamptz,
    new_price numeric,
    was_extended boolean,
    new_ends_at timestamptz,
    reserve_met boolean
  )
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
  AS $function$
  DECLARE
    v_status text;
    v_current_price numeric;
    v_ends_at timestamptz;
    v_reserve_price numeric;
    v_reserve_met boolean;
    v_now timestamptz := now();
    v_auth_uid uuid := auth.uid();
  BEGIN
    IF v_auth_uid IS NULL THEN
      RAISE EXCEPTION 'Authentication required' USING ERRCODE = '28000';
    END IF;

    IF p_bidder_id IS NULL OR p_bidder_id <> v_auth_uid THEN
      RAISE EXCEPTION 'Invalid bidder' USING ERRCODE = '28000';
    END IF;

    IF p_amount IS NULL OR p_amount <= 0 THEN
      RAISE EXCEPTION 'Invalid bid amount' USING ERRCODE = '22023';
    END IF;

    SELECT
      a.status,
      a.current_price,
      a.ends_at,
      a.reserve_price
    INTO
      v_status,
      v_current_price,
      v_ends_at,
      v_reserve_price
    FROM public.auctions a
    WHERE a.id = p_auction_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Auction not found' USING ERRCODE = 'P0002';
    END IF;

    IF v_status <> 'open' THEN
      RAISE EXCEPTION 'Auction ended' USING ERRCODE = 'P0001';
    END IF;

    IF v_ends_at IS NOT NULL AND v_ends_at <= v_now THEN
      UPDATE public.auctions
      SET status = 'closed', updated_at = TIMEZONE('utc'::text, NOW())
      WHERE id = p_auction_id;
      RAISE EXCEPTION 'Auction ended' USING ERRCODE = 'P0001';
    END IF;

    IF p_amount <= v_current_price THEN
      RAISE EXCEPTION 'Outbid' USING ERRCODE = 'P0003';
    END IF;

    was_extended := false;
    new_ends_at := v_ends_at;

    IF v_ends_at IS NOT NULL AND (v_ends_at - v_now) <= interval '60 seconds' THEN
      new_ends_at := v_ends_at + interval '120 seconds';
      was_extended := true;
    END IF;

    v_reserve_met := CASE
      WHEN v_reserve_price IS NULL THEN true
      ELSE p_amount >= v_reserve_price
    END;

    INSERT INTO public.bids (auction_id, bidder_id, amount, display_name)
    VALUES (p_auction_id, p_bidder_id, p_amount, NULLIF(BTRIM(p_display_name), ''))
    RETURNING id, auction_id, bidder_id, amount, created_at
    INTO bid_id, auction_id, bidder_id, amount, created_at;

    UPDATE public.auctions
    SET
      current_price = p_amount,
      ends_at = new_ends_at,
      reserve_met = v_reserve_met,
      updated_at = TIMEZONE('utc'::text, NOW())
    WHERE id = p_auction_id;

    new_price := p_amount;
    reserve_met := v_reserve_met;
    RETURN NEXT;
  END;
  $function$;
  $fn$;

  EXECUTE 'REVOKE ALL ON FUNCTION public.place_bid_atomic(uuid, uuid, numeric, text) FROM PUBLIC';
  EXECUTE 'GRANT EXECUTE ON FUNCTION public.place_bid_atomic(uuid, uuid, numeric, text) TO authenticated';
END;
$$;


/* FILE: 20260101_setup_users.sql */

-- Create users table linked to auth.users and set up RLS and triggers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  phone TEXT,
  name TEXT,
  street TEXT,
  postal_code TEXT,
  country TEXT,
  role TEXT DEFAULT 'USER_REGISTERED' CHECK (role IN ('USER_REGISTERED','USER_EMAIL_VERIFIED','USER_FULL_VERIFIED','ADMIN')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (current_timestamp at time zone 'utc') NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT (current_timestamp at time zone 'utc') NOT NULL
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = (current_timestamp at time zone 'utc');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.users;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'USER_REGISTERED')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_email_confirmation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND (OLD.email_confirmed_at IS NULL OR OLD.email_confirmed_at != NEW.email_confirmed_at) THEN
    UPDATE public.users SET role = 'USER_EMAIL_VERIFIED' WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_email_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_email_confirmation();

/* FILE: 20260102_update_snipping_logic.sql */

-- Migration: Update Snipping Protection Logic
-- Description: Updates the place_bid_atomic function to extend auction by 5 minutes
--              if a bid is placed within the last 5 minutes (Snipping Protection).
--              Previously it was 60s threshold / 120s extension.

DO $$
BEGIN
  -- Re-create the function with updated logic
  CREATE OR REPLACE FUNCTION public.place_bid_atomic(
    p_auction_id uuid,
    p_bidder_id uuid,
    p_amount numeric,
    p_display_name text DEFAULT NULL
  )
  RETURNS TABLE (
    bid_id uuid,
    auction_id uuid,
    bidder_id uuid,
    amount numeric,
    created_at timestamptz,
    new_price numeric,
    was_extended boolean,
    new_ends_at timestamptz,
    reserve_met boolean
  )
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
  AS $function$
  DECLARE
    v_status text;
    v_current_price numeric;
    v_ends_at timestamptz;
    v_reserve_price numeric;
    v_reserve_met boolean;
    v_now timestamptz := now();
    v_auth_uid uuid := auth.uid();
  BEGIN
    -- 1. Authentication Check
    IF v_auth_uid IS NULL THEN
      RAISE EXCEPTION 'Authentication required' USING ERRCODE = '28000';
    END IF;

    IF p_bidder_id IS NULL OR p_bidder_id <> v_auth_uid THEN
      RAISE EXCEPTION 'Invalid bidder' USING ERRCODE = '28000';
    END IF;

    -- 2. Basic Validation
    IF p_amount IS NULL OR p_amount <= 0 THEN
      RAISE EXCEPTION 'Invalid bid amount' USING ERRCODE = '22023';
    END IF;

    -- 3. Lock Auction Row
    SELECT
      a.status,
      a.current_price,
      a.ends_at,
      a.reserve_price
    INTO
      v_status,
      v_current_price,
      v_ends_at,
      v_reserve_price
    FROM public.auctions a
    WHERE a.id = p_auction_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Auction not found' USING ERRCODE = 'P0002';
    END IF;

    IF v_status <> 'open' THEN
      RAISE EXCEPTION 'Auction ended' USING ERRCODE = 'P0001';
    END IF;

    -- 4. Check Time
    IF v_ends_at IS NOT NULL AND v_ends_at <= v_now THEN
      -- Close auction if time passed (lazy close)
      UPDATE public.auctions
      SET status = 'closed', updated_at = TIMEZONE('utc'::text, NOW())
      WHERE id = p_auction_id;
      RAISE EXCEPTION 'Auction ended' USING ERRCODE = 'P0001';
    END IF;

    -- 5. Check Amount
    IF p_amount <= v_current_price THEN
      RAISE EXCEPTION 'Outbid' USING ERRCODE = 'P0003';
    END IF;

    -- 6. Calculate New End Time (Snipping Protection)
    was_extended := false;
    new_ends_at := v_ends_at;

    -- LOGIC UPDATE: If bid in last 5 minutes, extend by 5 minutes
    IF v_ends_at IS NOT NULL AND (v_ends_at - v_now) <= interval '5 minutes' THEN
      new_ends_at := v_ends_at + interval '5 minutes';
      was_extended := true;
    END IF;

    -- 7. Reserve Price Check
    v_reserve_met := CASE
      WHEN v_reserve_price IS NULL THEN true
      ELSE p_amount >= v_reserve_price
    END;

    -- 8. Insert Bid
    INSERT INTO public.bids (auction_id, bidder_id, amount, display_name)
    VALUES (p_auction_id, p_bidder_id, p_amount, NULLIF(BTRIM(p_display_name), ''))
    RETURNING id, auction_id, bidder_id, amount, created_at
    INTO bid_id, auction_id, bidder_id, amount, created_at;

    -- 9. Update Auction
    UPDATE public.auctions
    SET
      current_price = p_amount,
      ends_at = new_ends_at,
      reserve_met = v_reserve_met,
      updated_at = TIMEZONE('utc'::text, NOW())
    WHERE id = p_auction_id;

    new_price := p_amount;
    reserve_met := v_reserve_met;
    RETURN NEXT;
  END;
  $function$;

  -- Ensure permissions
  EXECUTE 'GRANT EXECUTE ON FUNCTION public.place_bid_atomic(uuid, uuid, numeric, text) TO authenticated';
END;
$$;

/* FILE: 20260103_users_backfill.sql */

-- Backfill public.users for any existing auth.users
INSERT INTO users (id, email, role, created_at, updated_at)
SELECT u.id, u.email, 'USER_REGISTERED', TIMEZONE('utc', NOW()), TIMEZONE('utc', NOW())
FROM auth.users u
LEFT JOIN users p ON p.id = u.id
WHERE p.id IS NULL;
