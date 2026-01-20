-- Enable RLS on pigeon_profiles table
ALTER TABLE public.pigeon_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can view pigeon profiles" ON public.pigeon_profiles;
DROP POLICY IF EXISTS "Owners can manage pigeon profiles" ON public.pigeon_profiles;

-- Create restrictive policies: only authenticated users can read their own pigeon profiles
CREATE POLICY "Authenticated users can view own pigeon profiles"
  ON public.pigeon_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.auctions a
      WHERE a.id = pigeon_profiles.auction_id
      AND a.owner_id = auth.uid()
    )
  );

-- Owners can insert pigeon profiles for their auctions
CREATE POLICY "Owners can insert pigeon profiles"
  ON public.pigeon_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.auctions a
      WHERE a.id = pigeon_profiles.auction_id
      AND a.owner_id = auth.uid()
    )
  );

-- Owners can update their own pigeon profiles
CREATE POLICY "Owners can update own pigeon profiles"
  ON public.pigeon_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.auctions a
      WHERE a.id = pigeon_profiles.auction_id
      AND a.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.auctions a
      WHERE a.id = pigeon_profiles.auction_id
      AND a.owner_id = auth.uid()
    )
  );

-- Owners can delete their own pigeon profiles
CREATE POLICY "Owners can delete own pigeon profiles"
  ON public.pigeon_profiles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.auctions a
      WHERE a.id = pigeon_profiles.auction_id
      AND a.owner_id = auth.uid()
    )
  );
