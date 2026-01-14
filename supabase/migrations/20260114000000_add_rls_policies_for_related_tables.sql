-- Migration: Add RLS policies for auction-related tables
-- Description: Ensure pigeon_profiles, auction_images, auction_videos, auction_documents have proper RLS policies

-- Enable RLS on pigeon_profiles if not already enabled
ALTER TABLE public.pigeon_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for pigeon_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'pigeon_profiles'
    AND policyname = 'Public can select pigeon_profiles'
  ) THEN
    CREATE POLICY "Public can select pigeon_profiles" ON public.pigeon_profiles
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'pigeon_profiles'
    AND policyname = 'Owners can insert pigeon_profiles'
  ) THEN
    CREATE POLICY "Owners can insert pigeon_profiles" ON public.pigeon_profiles
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.auctions a
          WHERE a.id = auction_id AND a.owner_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'pigeon_profiles'
    AND policyname = 'Owners can update pigeon_profiles'
  ) THEN
    CREATE POLICY "Owners can update pigeon_profiles" ON public.pigeon_profiles
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM public.auctions a
          WHERE a.id = auction_id AND a.owner_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'pigeon_profiles'
    AND policyname = 'Owners can delete pigeon_profiles'
  ) THEN
    CREATE POLICY "Owners can delete pigeon_profiles" ON public.pigeon_profiles
      FOR DELETE USING (
        EXISTS (
          SELECT 1 FROM public.auctions a
          WHERE a.id = auction_id AND a.owner_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Enable RLS on auction_images if not already enabled
ALTER TABLE public.auction_images ENABLE ROW LEVEL SECURITY;

-- Policies for auction_images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'auction_images'
    AND policyname = 'Public can select auction_images'
  ) THEN
    CREATE POLICY "Public can select auction_images" ON public.auction_images
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'auction_images'
    AND policyname = 'Owners can insert auction_images'
  ) THEN
    CREATE POLICY "Owners can insert auction_images" ON public.auction_images
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.auctions a
          WHERE a.id = auction_id AND a.owner_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'auction_images'
    AND policyname = 'Owners can update auction_images'
  ) THEN
    CREATE POLICY "Owners can update auction_images" ON public.auction_images
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM public.auctions a
          WHERE a.id = auction_id AND a.owner_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'auction_images'
    AND policyname = 'Owners can delete auction_images'
  ) THEN
    CREATE POLICY "Owners can delete auction_images" ON public.auction_images
      FOR DELETE USING (
        EXISTS (
          SELECT 1 FROM public.auctions a
          WHERE a.id = auction_id AND a.owner_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Enable RLS on auction_videos if not already enabled
ALTER TABLE public.auction_videos ENABLE ROW LEVEL SECURITY;

-- Policies for auction_videos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'auction_videos'
    AND policyname = 'Public can select auction_videos'
  ) THEN
    CREATE POLICY "Public can select auction_videos" ON public.auction_videos
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'auction_videos'
    AND policyname = 'Owners can insert auction_videos'
  ) THEN
    CREATE POLICY "Owners can insert auction_videos" ON public.auction_videos
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.auctions a
          WHERE a.id = auction_id AND a.owner_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'auction_videos'
    AND policyname = 'Owners can update auction_videos'
  ) THEN
    CREATE POLICY "Owners can update auction_videos" ON public.auction_videos
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM public.auctions a
          WHERE a.id = auction_id AND a.owner_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'auction_videos'
    AND policyname = 'Owners can delete auction_videos'
  ) THEN
    CREATE POLICY "Owners can delete auction_videos" ON public.auction_videos
      FOR DELETE USING (
        EXISTS (
          SELECT 1 FROM public.auctions a
          WHERE a.id = auction_id AND a.owner_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Enable RLS on auction_documents if not already enabled
ALTER TABLE public.auction_documents ENABLE ROW LEVEL SECURITY;

-- Policies for auction_documents
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'auction_documents'
    AND policyname = 'Public can select auction_documents'
  ) THEN
    CREATE POLICY "Public can select auction_documents" ON public.auction_documents
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'auction_documents'
    AND policyname = 'Owners can insert auction_documents'
  ) THEN
    CREATE POLICY "Owners can insert auction_documents" ON public.auction_documents
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.auctions a
          WHERE a.id = auction_id AND a.owner_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'auction_documents'
    AND policyname = 'Owners can update auction_documents'
  ) THEN
    CREATE POLICY "Owners can update auction_documents" ON public.auction_documents
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM public.auctions a
          WHERE a.id = auction_id AND a.owner_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'auction_documents'
    AND policyname = 'Owners can delete auction_documents'
  ) THEN
    CREATE POLICY "Owners can delete auction_documents" ON public.auction_documents
      FOR DELETE USING (
        EXISTS (
          SELECT 1 FROM public.auctions a
          WHERE a.id = auction_id AND a.owner_id = auth.uid()
        )
      );
  END IF;
END $$;
