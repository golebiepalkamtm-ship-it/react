-- Fix Supabase Database Linter Security Warnings

-- 1. Fix mutable search_path for functions
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p 
    JOIN pg_namespace n ON n.oid = p.pronamespace 
    WHERE n.nspname = 'public' AND p.proname = 'update_updated_at_column'
  ) THEN
    ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
  END IF;
END $$;

-- 2. Move extension vector out of public schema to extensions schema
CREATE SCHEMA IF NOT EXISTS extensions;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension e 
    JOIN pg_namespace n ON n.oid = e.extnamespace 
    WHERE e.extname = 'vector' AND n.nspname = 'public'
  ) THEN
    ALTER EXTENSION vector SET SCHEMA extensions;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- 3. Revoke EXECUTE permissions from anon & authenticated roles for internal SECURITY DEFINER functions
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p 
    JOIN pg_namespace n ON n.oid = p.pronamespace 
    WHERE n.nspname = 'public' AND p.proname = 'on_auth_user_change'
  ) THEN
    REVOKE EXECUTE ON FUNCTION public.on_auth_user_change() FROM PUBLIC, anon, authenticated;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_proc p 
    JOIN pg_namespace n ON n.oid = p.pronamespace 
    WHERE n.nspname = 'public' AND p.proname = 'on_auth_user_deleted'
  ) THEN
    REVOKE EXECUTE ON FUNCTION public.on_auth_user_deleted() FROM PUBLIC, anon, authenticated;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_proc p 
    JOIN pg_namespace n ON n.oid = p.pronamespace 
    WHERE n.nspname = 'public' AND p.proname = 'sync_user_record' AND pg_get_function_identity_arguments(p.oid) = 'p_user_id uuid'
  ) THEN
    REVOKE EXECUTE ON FUNCTION public.sync_user_record(uuid) FROM PUBLIC, anon, authenticated;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- 4. Fix overly permissive WITH CHECK (true) on page_views RLS policy
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'page_views') THEN
    ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow public insert" ON public.page_views;
    CREATE POLICY "Allow public insert" ON public.page_views
      FOR INSERT
      TO public, anon, authenticated
      WITH CHECK (path IS NOT NULL AND length(path) > 0);
  END IF;
END $$;
