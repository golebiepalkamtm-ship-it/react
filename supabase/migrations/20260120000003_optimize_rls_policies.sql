-- Migration: Optimize RLS policies and remove duplicates
-- Description: Fix performance issues and remove redundant policies

-- Step 1: Remove duplicate policies

-- Remove duplicate meeting policies
DROP POLICY IF EXISTS "Anyone can read meetings" ON public.meetings;

-- Remove overly permissive reference policy (keep only approved for public)
DROP POLICY IF EXISTS "Public can view references" ON public.references;

-- Remove "Enable all for auth" policy from users (we have specific policies)
DROP POLICY IF EXISTS "Enable all for auth" ON public.users;

-- Remove duplicate SELECT policies for auction tables
DROP POLICY IF EXISTS "Auction videos are viewable by everyone" ON public.auction_videos;
DROP POLICY IF EXISTS "Auction documents are viewable by everyone" ON public.auction_documents;
DROP POLICY IF EXISTS "Auction images are viewable by everyone" ON public.auction_images;

-- Step 2: Recreate optimized policies with (select auth.uid())

-- PAYMENTS - optimize performance
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
CREATE POLICY "Users can view own payments"
  ON public.payments
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can create own payments" ON public.payments;
CREATE POLICY "Users can create own payments"
  ON public.payments
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- WATCHLIST - optimize performance
DROP POLICY IF EXISTS "Users can view own watchlist" ON public.watchlist;
CREATE POLICY "Users can view own watchlist" 
  ON public.watchlist 
  FOR SELECT 
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can add to own watchlist" ON public.watchlist;
CREATE POLICY "Users can add to own watchlist"
  ON public.watchlist
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can remove from own watchlist" ON public.watchlist;
CREATE POLICY "Users can remove from own watchlist"
  ON public.watchlist
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- PIGEON - optimize performance
DROP POLICY IF EXISTS "Authenticated users can create pigeons" ON public.pigeon;
CREATE POLICY "Authenticated users can create pigeons"
  ON public.pigeon
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.role()) = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update pigeons" ON public.pigeon;
CREATE POLICY "Authenticated users can update pigeons"
  ON public.pigeon
  FOR UPDATE
  TO authenticated
  USING ((select auth.role()) = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete pigeons" ON public.pigeon;
CREATE POLICY "Authenticated users can delete pigeons"
  ON public.pigeon
  FOR DELETE
  TO authenticated
  USING ((select auth.role()) = 'authenticated');

-- REFERENCES - optimize performance
DROP POLICY IF EXISTS "Authenticated users can create references" ON public.references;
CREATE POLICY "Authenticated users can create references"
  ON public.references
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.role()) = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update references" ON public.references;
CREATE POLICY "Authenticated users can update references"
  ON public.references
  FOR UPDATE
  TO authenticated
  USING ((select auth.role()) = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete references" ON public.references;
CREATE POLICY "Authenticated users can delete references"
  ON public.references
  FOR DELETE
  TO authenticated
  USING ((select auth.role()) = 'authenticated');

-- BIDS - optimize performance
DROP POLICY IF EXISTS "Authenticated users can place bids" ON public.bids;
CREATE POLICY "Authenticated users can place bids" 
  ON public.bids 
  FOR INSERT 
  TO authenticated
  WITH CHECK ((select auth.role()) = 'authenticated' AND (select auth.uid()) = bidder_id);

-- PIGEON_PROFILES - optimize performance  
DROP POLICY IF EXISTS "Authenticated users can view own pigeon profiles" ON public.pigeon_profiles;
CREATE POLICY "Authenticated users can view own pigeon profiles"
  ON public.pigeon_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.auctions a
      WHERE a.id = pigeon_profiles.auction_id
      AND a.owner_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Owners can insert pigeon profiles" ON public.pigeon_profiles;
CREATE POLICY "Owners can insert pigeon profiles"
  ON public.pigeon_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.auctions a
      WHERE a.id = pigeon_profiles.auction_id
      AND a.owner_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Owners can update own pigeon profiles" ON public.pigeon_profiles;
CREATE POLICY "Owners can update own pigeon profiles"
  ON public.pigeon_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.auctions a
      WHERE a.id = pigeon_profiles.auction_id
      AND a.owner_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.auctions a
      WHERE a.id = pigeon_profiles.auction_id
      AND a.owner_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Owners can delete own pigeon profiles" ON public.pigeon_profiles;
CREATE POLICY "Owners can delete own pigeon profiles"
  ON public.pigeon_profiles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.auctions a
      WHERE a.id = pigeon_profiles.auction_id
      AND a.owner_id = (select auth.uid())
    )
  );

-- AUCTION_VIDEOS, AUCTION_DOCUMENTS, AUCTION_IMAGES - optimize and consolidate
-- Use FOR ALL to combine SELECT and other operations
DROP POLICY IF EXISTS "Auction owners can manage videos" ON public.auction_videos;
CREATE POLICY "Auction owners can manage videos"
  ON public.auction_videos
  FOR ALL
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.auctions a
      WHERE a.id = auction_videos.auction_id
      AND a.owner_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Auction owners can manage documents" ON public.auction_documents;
CREATE POLICY "Auction owners can manage documents"
  ON public.auction_documents
  FOR ALL
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.auctions a
      WHERE a.id = auction_documents.auction_id
      AND a.owner_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Auction owners can manage images" ON public.auction_images;
CREATE POLICY "Auction owners can manage images"
  ON public.auction_images
  FOR ALL
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.auctions a
      WHERE a.id = auction_images.auction_id
      AND a.owner_id = (select auth.uid())
    )
  );

-- USERS - optimize existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  TO public
  USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO public
  USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile"
  ON public.users
  FOR INSERT
  TO public
  WITH CHECK ((select auth.uid()) = id);
