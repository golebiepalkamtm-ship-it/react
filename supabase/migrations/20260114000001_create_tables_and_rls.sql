-- Migration: Create missing auction-related tables and add RLS policies
-- Description: Ensure all auction-related tables exist and have proper RLS policies

-- Create pigeon_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.pigeon_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  auction_id UUID UNIQUE REFERENCES public.auctions(id) ON DELETE CASCADE,
  bloodline TEXT NOT NULL,
  achievements TEXT,
  eye_color TEXT,
  feather_color TEXT,
  vitality TEXT,
  length TEXT,
  endurance TEXT,
  fork_strength TEXT,
  fork_alignment TEXT,
  muscles TEXT,
  balance TEXT,
  back TEXT,
  purpose TEXT,
  gender TEXT CHECK (gender IN ('male','female')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create auction_images table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.auction_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  auction_id UUID REFERENCES public.auctions(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  ordering INT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create auction_videos table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.auction_videos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  auction_id UUID REFERENCES public.auctions(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create auction_documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.auction_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  auction_id UUID REFERENCES public.auctions(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_pigeon_profiles_auction_id ON public.pigeon_profiles(auction_id);
CREATE INDEX IF NOT EXISTS idx_auction_images_auction_id ON public.auction_images(auction_id);
CREATE INDEX IF NOT EXISTS idx_auction_videos_auction_id ON public.auction_videos(auction_id);
CREATE INDEX IF NOT EXISTS idx_auction_documents_auction_id ON public.auction_documents(auction_id);

-- Enable RLS on all tables
ALTER TABLE public.pigeon_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_documents ENABLE ROW LEVEL SECURITY;

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
