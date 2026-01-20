-- Migration: Enable RLS on all remaining tables
-- Description: Fix security issues by enabling RLS on all public tables

-- 1. Enable RLS on all tables that are missing it
ALTER TABLE public.pigeon ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.references ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_images ENABLE ROW LEVEL SECURITY;

-- 2. PIGEON Table Policies
-- Public can view all pigeons
CREATE POLICY "Pigeons are viewable by everyone"
  ON public.pigeon
  FOR SELECT
  USING (true);

-- Only authenticated users can create pigeons
CREATE POLICY "Authenticated users can create pigeons"
  ON public.pigeon
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can update pigeons
CREATE POLICY "Authenticated users can update pigeons"
  ON public.pigeon
  FOR UPDATE
  TO authenticated
  USING (auth.role() = 'authenticated');

-- Authenticated users can delete pigeons
CREATE POLICY "Authenticated users can delete pigeons"
  ON public.pigeon
  FOR DELETE
  TO authenticated
  USING (auth.role() = 'authenticated');

-- 3. BIDS Table Policies (already exist, just need RLS enabled)
-- Policies should already be created from previous migrations

-- 4. PAYMENTS Table Policies (already exist, just need RLS enabled)
-- Policies should already be created from previous migrations

-- 5. WATCHLIST Table Policies (already exist, just need RLS enabled)
-- Policies should already be created from previous migrations

-- 6. REFERENCES Table Policies
-- Public can view approved references only
CREATE POLICY "Public can view approved references"
  ON public.references
  FOR SELECT
  USING ("isApproved" = true);

-- Authenticated users can view all references
CREATE POLICY "Authenticated users can view all references"
  ON public.references
  FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can create references
CREATE POLICY "Authenticated users can create references"
  ON public.references
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can update references (admin approval workflow)
CREATE POLICY "Authenticated users can update references"
  ON public.references
  FOR UPDATE
  TO authenticated
  USING (auth.role() = 'authenticated');

-- Authenticated users can delete references
CREATE POLICY "Authenticated users can delete references"
  ON public.references
  FOR DELETE
  TO authenticated
  USING (auth.role() = 'authenticated');

-- 7. AUCTION_VIDEOS Table Policies
-- Public can view all auction videos
CREATE POLICY "Auction videos are viewable by everyone"
  ON public.auction_videos
  FOR SELECT
  USING (true);

-- Auction owners can manage their videos
CREATE POLICY "Auction owners can manage videos"
  ON public.auction_videos
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.auctions a
      WHERE a.id = auction_videos.auction_id
      AND a.owner_id = auth.uid()
    )
  );

-- 8. AUCTION_DOCUMENTS Table Policies
-- Public can view all auction documents
CREATE POLICY "Auction documents are viewable by everyone"
  ON public.auction_documents
  FOR SELECT
  USING (true);

-- Auction owners can manage their documents
CREATE POLICY "Auction owners can manage documents"
  ON public.auction_documents
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.auctions a
      WHERE a.id = auction_documents.auction_id
      AND a.owner_id = auth.uid()
    )
  );

-- 9. AUCTION_IMAGES Table Policies
-- Public can view all auction images
CREATE POLICY "Auction images are viewable by everyone"
  ON public.auction_images
  FOR SELECT
  USING (true);

-- Auction owners can manage their images
CREATE POLICY "Auction owners can manage images"
  ON public.auction_images
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.auctions a
      WHERE a.id = auction_images.auction_id
      AND a.owner_id = auth.uid()
    )
  );
