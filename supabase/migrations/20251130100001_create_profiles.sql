-- supabase/migrations/create_profiles_sync.sql
-- Create profiles table and sync with auth.users via triggers

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT,
  bio TEXT,
  role TEXT DEFAULT 'USER_REGISTERED' CHECK (role IN ('USER_REGISTERED','USER_EMAIL_VERIFIED','USER_FULL_VERIFIED','ADMIN')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies: users can view own profile; admins can view all
DROP POLICY IF EXISTS "Profiles: users can view own profile or admin" ON public.profiles;
CREATE POLICY "Profiles: users can view own profile or admin" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'ADMIN'));

-- Users can update only their profile
DROP POLICY IF EXISTS "Profiles: users can update own profile" ON public.profiles;
CREATE POLICY "Profiles: users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert (on auth.user creation) only matching id
DROP POLICY IF EXISTS "Profiles: insert for new users" ON public.profiles;
CREATE POLICY "Profiles: insert for new users" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can delete own profile (or admin)
DROP POLICY IF EXISTS "Profiles: delete own or admin" ON public.profiles;
CREATE POLICY "Profiles: delete own or admin" ON public.profiles
  FOR DELETE USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'ADMIN'));

-- Function to create profile when auth.user created
CREATE OR REPLACE FUNCTION public.handle_auth_user_created_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (NEW.id, NEW.email, 'USER_REGISTERED')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to fire after insert on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_auth_user_created_profile();

-- Function to handle email confirmation and update role
CREATE OR REPLACE FUNCTION public.handle_auth_user_email_confirmation_profile()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND (OLD.email_confirmed_at IS NULL OR OLD.email_confirmed_at != NEW.email_confirmed_at) THEN
    UPDATE public.profiles SET role = 'USER_EMAIL_VERIFIED' WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for updates on auth.users
DROP TRIGGER IF EXISTS on_auth_user_email_confirmed_profile ON auth.users;
CREATE TRIGGER on_auth_user_email_confirmed_profile
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_auth_user_email_confirmation_profile();

-- Use existing handle_updated_at trigger if present
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_updated_at') THEN
    DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
    CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
  END IF;
END$$;
