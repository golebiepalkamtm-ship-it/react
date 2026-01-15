-- Create Postgres enum to match Prisma AuctionStatus (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'auctionstatus') THEN
    CREATE TYPE "AuctionStatus" AS ENUM ('ACTIVE', 'ENDED', 'CANCELLED');
  END IF;
END $$;

-- Normalize values before cast (safety)
UPDATE auctions SET status = UPPER(status);

-- Drop legacy check constraint if present
ALTER TABLE public.auctions DROP CONSTRAINT IF EXISTS auctions_status_check;

-- Align column with enum and default
ALTER TABLE public.auctions
  ALTER COLUMN status DROP DEFAULT,
  ALTER COLUMN status TYPE "AuctionStatus" USING UPPER(status)::"AuctionStatus",
  ALTER COLUMN status SET DEFAULT 'ACTIVE';

-- Normalize nulls (safety)
UPDATE auctions SET status = 'ACTIVE' WHERE status IS NULL;
