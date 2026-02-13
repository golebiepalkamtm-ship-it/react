-- Migration: Fix references column names and RLS policies
-- Problem: Original migration created columns with camelCase ("breederName", "isApproved", etc.)
-- but Prisma schema maps them to snake_case (breeder_name, is_approved, etc.)
-- After prisma db push, columns may be in either format depending on what ran last.
-- Step 1: Rename columns from camelCase to snake_case IF they still use camelCase
-- Use DO block to handle both cases gracefully
DO $$ BEGIN -- Rename "breederName" → breeder_name (if camelCase version exists)
IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
        AND table_name = 'references'
        AND column_name = 'breederName'
) THEN
ALTER TABLE public.references
    RENAME COLUMN "breederName" TO breeder_name;
END IF;
-- Rename "pigeonName" → pigeon_name
IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
        AND table_name = 'references'
        AND column_name = 'pigeonName'
) THEN
ALTER TABLE public.references
    RENAME COLUMN "pigeonName" TO pigeon_name;
END IF;
-- Rename "isApproved" → is_approved
IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
        AND table_name = 'references'
        AND column_name = 'isApproved'
) THEN
ALTER TABLE public.references
    RENAME COLUMN "isApproved" TO is_approved;
END IF;
-- Note: created_at and updated_at were already snake_case in original migration
END $$;
-- Step 2: Drop ALL existing RLS policies for references to start clean
DROP POLICY IF EXISTS "Public can view approved references" ON public.references;
DROP POLICY IF EXISTS "Public can view all references" ON public.references;
DROP POLICY IF EXISTS "Public Select References" ON public.references;
DROP POLICY IF EXISTS "Authenticated users can view all references" ON public.references;
DROP POLICY IF EXISTS "Authenticated users can create references" ON public.references;
DROP POLICY IF EXISTS "Authenticated users can update references" ON public.references;
DROP POLICY IF EXISTS "Authenticated users can delete references" ON public.references;
DROP POLICY IF EXISTS "Admins can do everything with references" ON public.references;
-- Step 3: Enable RLS
ALTER TABLE public.references ENABLE ROW LEVEL SECURITY;
-- Step 4: Create clean policies using snake_case column names
-- SELECT: anon sees approved only, authenticated sees all
CREATE POLICY "references_select_policy" ON public.references FOR
SELECT USING (
        is_approved = true
        OR (auth.role() = 'authenticated')
        OR (auth.role() = 'service_role')
    );
-- INSERT: both anon and authenticated can insert new references (public feature)
CREATE POLICY "references_insert_policy" ON public.references FOR
INSERT WITH CHECK (true);
-- UPDATE: only authenticated users
CREATE POLICY "references_update_policy" ON public.references FOR
UPDATE TO authenticated USING (auth.role() = 'authenticated');
-- DELETE: only authenticated users
CREATE POLICY "references_delete_policy" ON public.references FOR DELETE TO authenticated USING (auth.role() = 'authenticated');
-- Step 5: Grant permissions
GRANT SELECT,
    INSERT ON public.references TO anon;
GRANT SELECT,
    INSERT,
    UPDATE,
    DELETE ON public.references TO authenticated;
-- Step 6: Fix meetings INSERT policy for authenticated users
DROP POLICY IF EXISTS "meetings_insert_policy" ON public.meetings;
DROP POLICY IF EXISTS "Authenticated users can insert meetings" ON public.meetings;
CREATE POLICY "meetings_insert_policy" ON public.meetings FOR
INSERT TO authenticated WITH CHECK (auth.role() = 'authenticated');
GRANT INSERT ON public.meetings TO authenticated;