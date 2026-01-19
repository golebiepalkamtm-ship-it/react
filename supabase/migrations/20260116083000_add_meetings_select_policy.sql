-- Allow public read access to meetings (required for frontend listing)
DROP POLICY IF EXISTS "Anyone can read meetings" ON public.meetings;
CREATE POLICY "Anyone can read meetings"
  ON public.meetings
  FOR SELECT
  USING (true);
