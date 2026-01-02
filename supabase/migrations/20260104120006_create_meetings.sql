-- Create meetings table
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

-- Enable RLS
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

-- Policies
-- Public can view meetings
DROP POLICY IF EXISTS "Public can view meetings" ON public.meetings;
CREATE POLICY "Public can view meetings" ON public.meetings
  FOR SELECT USING (true);

-- Authenticated users (with correct role checked by app) or admins can insert
DROP POLICY IF EXISTS "Authenticated users can insert meetings" ON public.meetings;
CREATE POLICY "Authenticated users can insert meetings" ON public.meetings
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Authors or admins can update/delete
DROP POLICY IF EXISTS "Authors can update meetings" ON public.meetings;
CREATE POLICY "Authors can update meetings" ON public.meetings
  FOR UPDATE USING (auth.uid() = author_id OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'ADMIN'));

DROP POLICY IF EXISTS "Authors can delete meetings" ON public.meetings;
CREATE POLICY "Authors can delete meetings" ON public.meetings
  FOR DELETE USING (auth.uid() = author_id OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'ADMIN'));

-- Trigger for updated_at
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_updated_at') THEN
    DROP TRIGGER IF EXISTS set_updated_at_meetings ON public.meetings;
    CREATE TRIGGER set_updated_at_meetings BEFORE UPDATE ON public.meetings FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
  END IF;
END$$;
