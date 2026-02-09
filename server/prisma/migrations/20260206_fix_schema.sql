-- Fix references casing and ensure auctions.version exists
-- Run on DIRECT_URL (5432), not via pooler.

BEGIN;

-- references: camelCase -> snake_case (guarded)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'references' AND column_name = 'breederName'
  ) THEN
    EXECUTE 'ALTER TABLE public."references" RENAME COLUMN "breederName" TO breeder_name';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'references' AND column_name = 'pigeonName'
  ) THEN
    EXECUTE 'ALTER TABLE public."references" RENAME COLUMN "pigeonName" TO pigeon_name';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'references' AND column_name = 'isApproved'
  ) THEN
    EXECUTE 'ALTER TABLE public."references" RENAME COLUMN "isApproved" TO is_approved';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Ensure images column defaults to empty array (align with Prisma JSON default)
ALTER TABLE public."references"
  ALTER COLUMN images SET DEFAULT '[]'::jsonb;

-- auctions: ensure version column exists
ALTER TABLE IF EXISTS public.auctions
  ADD COLUMN IF NOT EXISTS version integer DEFAULT 1;

COMMIT;
