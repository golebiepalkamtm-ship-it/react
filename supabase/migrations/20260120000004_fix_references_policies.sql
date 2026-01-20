-- Migration: Fix remaining duplicate policy for references
-- Description: Consolidate references SELECT policies

-- For authenticated users, they should see all references (not just approved)
-- For public/anon users, they should see only approved references

-- Drop the old policy for public
DROP POLICY IF EXISTS "Public can view approved references" ON public.references;

-- Create a new combined policy that works for both public and authenticated
-- Authenticated users see all, public users see only approved
CREATE POLICY "Public can view approved references"
  ON public.references
  FOR SELECT
  TO public
  USING ("isApproved" = true OR (select auth.role()) = 'authenticated');
