-- Combined migration to ensure required DB objects exist (for deployments where migrations were not applied)
-- Run this on your Supabase database (via supabase CLI or psql with SERVICE_ROLE_KEY)

-- Ensure uuid extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ensure auctions-related tables/columns exist (safe guards using IF NOT EXISTS)
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

-- Bids table
CREATE TABLE IF NOT EXISTS public.bids (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  auction_id UUID REFERENCES public.auctions(id) ON DELETE CASCADE,
  bidder_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  display_name TEXT,
  amount numeric(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Watchlists
CREATE TABLE IF NOT EXISTS public.watchlists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  auction_id UUID REFERENCES public.auctions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE (user_id, auction_id)
);

-- Place bid function (idempotent via CREATE OR REPLACE)
DO $do$
BEGIN
  -- create function via EXECUTE so the supabase CLI (prepared statements) can apply it
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
  AS $function$
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
  $function$;
  $fn$;
END
$do$;

-- Close expired auctions function
DO $do$
BEGIN
  EXECUTE $fn$
  CREATE OR REPLACE FUNCTION public.close_expired_auctions()
  RETURNS integer
  LANGUAGE plpgsql
  AS $function$
  DECLARE
    v_updated integer;
  BEGIN
    UPDATE public.auctions
    SET status = 'closed', updated_at = TIMEZONE('utc'::text, NOW())
    WHERE status = 'open' AND ends_at IS NOT NULL AND ends_at <= NOW();

    GET DIAGNOSTICS v_updated = ROW_COUNT;
    RETURN v_updated;
  END;
  $function$;
  $fn$;
END
$do$;

-- Active auctions summary view
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

-- Meetings table
CREATE TABLE IF NOT EXISTS public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  date DATE,
  description TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE IF EXISTS public.meetings ENABLE ROW LEVEL SECURITY;

-- Basic policies for meetings
DROP POLICY IF EXISTS "Public can view meetings" ON public.meetings;
CREATE POLICY "Public can view meetings" ON public.meetings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert meetings" ON public.meetings;
CREATE POLICY "Authenticated users can insert meetings" ON public.meetings
  FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can update meetings" ON public.meetings;
CREATE POLICY "Authors can update meetings" ON public.meetings
  FOR UPDATE USING (auth.uid() = author_id OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'ADMIN'));

DROP POLICY IF EXISTS "Authors can delete meetings" ON public.meetings;
CREATE POLICY "Authors can delete meetings" ON public.meetings
  FOR DELETE USING (auth.uid() = author_id OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'ADMIN'));

-- Add updated_at trigger if handle_updated_at exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_updated_at') THEN
    DROP TRIGGER IF EXISTS set_updated_at_meetings ON public.meetings;
    CREATE TRIGGER set_updated_at_meetings BEFORE UPDATE ON public.meetings FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
  END IF;
END$$;
