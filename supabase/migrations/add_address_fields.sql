-- supabase/migrations/add_address_fields.sql

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS street TEXT,
  ADD COLUMN IF NOT EXISTS postal_code TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS is_blocked boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS blocked_until TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS banned_until TIMESTAMP WITH TIME ZONE;
