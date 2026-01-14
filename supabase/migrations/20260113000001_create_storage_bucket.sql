-- Create auction-media storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'auction-media',
  'auction-media',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'application/pdf', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
DROP POLICY IF EXISTS "Public read access for auction-media" ON storage.objects;
CREATE POLICY "Public read access for auction-media"
ON storage.objects FOR SELECT
USING (bucket_id = 'auction-media');

-- Allow authenticated users to upload
DROP POLICY IF EXISTS "Authenticated users can upload to auction-media" ON storage.objects;
CREATE POLICY "Authenticated users can upload to auction-media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'auction-media');

-- Allow users to update their own uploads
DROP POLICY IF EXISTS "Users can update own uploads in auction-media" ON storage.objects;
CREATE POLICY "Users can update own uploads in auction-media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'auction-media');

-- Allow users to delete their own uploads
DROP POLICY IF EXISTS "Users can delete own uploads in auction-media" ON storage.objects;
CREATE POLICY "Users can delete own uploads in auction-media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'auction-media');
