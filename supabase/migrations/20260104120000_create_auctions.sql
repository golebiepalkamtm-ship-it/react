-- supabase/migrations/create_auctions_bids_watchlist.sql
-- Schema-first migration: auctions, bids, watchlists with RLS and indexes

-- Auctions table
CREATE TABLE IF NOT EXISTS public.auctions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
DROP POLICY IF EXISTS "Public can select auctions" ON public.auctions;
CREATE POLICY "Public can select auctions" ON public.auctions
  FOR SELECT USING (true);

-- Owners or admins can insert auctions (owner_id must match auth.uid())
DROP POLICY IF EXISTS "Owners can insert auctions" ON public.auctions;
CREATE POLICY "Owners can insert auctions" ON public.auctions
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Owners or admins can update/delete their auctions
DROP POLICY IF EXISTS "Owners can update auctions" ON public.auctions;
CREATE POLICY "Owners can update auctions" ON public.auctions
  FOR UPDATE USING (auth.uid() = owner_id OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'ADMIN'));

DROP POLICY IF EXISTS "Owners can delete auctions" ON public.auctions;
CREATE POLICY "Owners can delete auctions" ON public.auctions
  FOR DELETE USING (auth.uid() = owner_id OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'ADMIN'));

CREATE INDEX IF NOT EXISTS idx_auctions_owner_id ON public.auctions(owner_id);
CREATE INDEX IF NOT EXISTS idx_auctions_status ON public.auctions(status);

-- Bids table
CREATE TABLE IF NOT EXISTS public.bids (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auction_id UUID REFERENCES public.auctions(id) ON DELETE CASCADE,
  bidder_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  display_name TEXT,
  amount numeric(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- Policies: allow public select for bids related to public auctions
DROP POLICY IF EXISTS "Public can select bids for auctions" ON public.bids;
CREATE POLICY "Public can select bids for auctions" ON public.bids
  FOR SELECT USING (true);

-- Authenticated user can insert a bid if bidder_id == auth.uid()
DROP POLICY IF EXISTS "Users can insert own bids" ON public.bids;
CREATE POLICY "Users can insert own bids" ON public.bids
  FOR INSERT WITH CHECK (auth.uid() = bidder_id);

-- Users can update/delete only their bids (or admin)
DROP POLICY IF EXISTS "Users can update bids" ON public.bids;
CREATE POLICY "Users can update bids" ON public.bids
  FOR UPDATE USING (auth.uid() = bidder_id OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'ADMIN'));

DROP POLICY IF EXISTS "Users can delete bids" ON public.bids;
CREATE POLICY "Users can delete bids" ON public.bids
  FOR DELETE USING (auth.uid() = bidder_id OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'ADMIN'));

CREATE INDEX IF NOT EXISTS idx_bids_auction_id ON public.bids(auction_id);
CREATE INDEX IF NOT EXISTS idx_bids_bidder_id ON public.bids(bidder_id);

-- Watchlist table
CREATE TABLE IF NOT EXISTS public.watchlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  auction_id UUID REFERENCES public.auctions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE (user_id, auction_id)
);

ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own watchlist" ON public.watchlists;
CREATE POLICY "Users can manage own watchlist" ON public.watchlists
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_watchlists_user_id ON public.watchlists(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlists_auction_id ON public.watchlists(auction_id);

-- Ensure updated_at is set on update using shared function if exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_updated_at') THEN
    DROP TRIGGER IF EXISTS set_updated_at_auctions ON public.auctions;
    CREATE TRIGGER set_updated_at_auctions BEFORE UPDATE ON public.auctions FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
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
