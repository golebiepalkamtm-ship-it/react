-- Fix RLS performance issues and add missing indexes
-- This migration optimizes RLS policies by using (select auth.uid()) instead of auth.uid()
-- and adds missing indexes for better query performance

-- ============================================
-- 1. Fix RLS policies for better performance
-- ============================================

-- Users table policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK ((select auth.uid()) = id);

-- Profiles table policies
DROP POLICY IF EXISTS "Profiles: users can view own profile or admin" ON public.profiles;
CREATE POLICY "Profiles: users can view own profile or admin" ON public.profiles
  FOR SELECT USING ((select auth.uid()) = id OR EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = (select auth.uid()) AND u.role = 'ADMIN'
  ));

DROP POLICY IF EXISTS "Profiles: users can update own profile" ON public.profiles;
CREATE POLICY "Profiles: users can update own profile" ON public.profiles
  FOR UPDATE USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Profiles: insert for new users" ON public.profiles;
CREATE POLICY "Profiles: insert for new users" ON public.profiles
  FOR INSERT WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Profiles: delete own or admin" ON public.profiles;
CREATE POLICY "Profiles: delete own or admin" ON public.profiles
  FOR DELETE USING ((select auth.uid()) = id OR EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = (select auth.uid()) AND u.role = 'ADMIN'
  ));

-- Auctions table policies
DROP POLICY IF EXISTS "Owners can insert auctions" ON public.auctions;
CREATE POLICY "Owners can insert auctions" ON public.auctions
  FOR INSERT WITH CHECK ((select auth.uid()) = owner_id);

DROP POLICY IF EXISTS "Owners can update auctions" ON public.auctions;
CREATE POLICY "Owners can update auctions" ON public.auctions
  FOR UPDATE USING ((select auth.uid()) = owner_id OR EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = (select auth.uid()) AND u.role = 'ADMIN'
  ));

DROP POLICY IF EXISTS "Owners can delete auctions" ON public.auctions;
CREATE POLICY "Owners can delete auctions" ON public.auctions
  FOR DELETE USING ((select auth.uid()) = owner_id OR EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = (select auth.uid()) AND u.role = 'ADMIN'
  ));

-- Bids table policies
DROP POLICY IF EXISTS "Users can insert own bids" ON public.bids;
CREATE POLICY "Users can insert own bids" ON public.bids
  FOR INSERT WITH CHECK ((select auth.uid()) = bidder_id);

DROP POLICY IF EXISTS "Users can update bids" ON public.bids;
CREATE POLICY "Users can update bids" ON public.bids
  FOR UPDATE USING ((select auth.uid()) = bidder_id OR EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = (select auth.uid()) AND u.role = 'ADMIN'
  ));

DROP POLICY IF EXISTS "Users can delete bids" ON public.bids;
CREATE POLICY "Users can delete bids" ON public.bids
  FOR DELETE USING ((select auth.uid()) = bidder_id OR EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = (select auth.uid()) AND u.role = 'ADMIN'
  ));

-- Watchlists table policies
DROP POLICY IF EXISTS "Users can manage own watchlist" ON public.watchlists;
CREATE POLICY "Users can manage own watchlist" ON public.watchlists
  FOR ALL USING ((select auth.uid()) = user_id) 
  WITH CHECK ((select auth.uid()) = user_id);

-- Meetings table policies
DROP POLICY IF EXISTS "Authenticated users can insert meetings" ON public.meetings;
CREATE POLICY "Authenticated users can insert meetings" ON public.meetings
  FOR INSERT WITH CHECK ((select auth.uid()) = author_id);

DROP POLICY IF EXISTS "Authors can update meetings" ON public.meetings;
CREATE POLICY "Authors can update meetings" ON public.meetings
  FOR UPDATE USING ((select auth.uid()) = author_id);

DROP POLICY IF EXISTS "Authors can delete meetings" ON public.meetings;
CREATE POLICY "Authors can delete meetings" ON public.meetings
  FOR DELETE USING ((select auth.uid()) = author_id);

-- ============================================
-- 2. Add missing indexes
-- ============================================

-- Add index for meetings.author_id foreign key
CREATE INDEX IF NOT EXISTS idx_meetings_author_id 
ON public.meetings(author_id);

-- Add additional useful indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_auctions_ends_at 
ON public.auctions(ends_at) 
WHERE ends_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_auctions_status_ends_at 
ON public.auctions(status, ends_at) 
WHERE status = 'open';

CREATE INDEX IF NOT EXISTS idx_bids_created_at 
ON public.bids(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bids_auction_created 
ON public.bids(auction_id, created_at DESC);

-- ============================================
-- 3. Add helpful comments
-- ============================================

COMMENT ON INDEX idx_meetings_author_id IS 'Index for foreign key meetings.author_id to improve join performance';
COMMENT ON INDEX idx_auctions_ends_at IS 'Index for filtering auctions by end time';
COMMENT ON INDEX idx_auctions_status_ends_at IS 'Composite index for active auctions queries';
COMMENT ON INDEX idx_bids_created_at IS 'Index for ordering bids by creation time';
COMMENT ON INDEX idx_bids_auction_created IS 'Composite index for auction bids queries';

