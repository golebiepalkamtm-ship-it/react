-- Migration to add missing Stripe and payment columns/enums

-- 1. Add stripe columns to users table
ALTER TABLE IF EXISTS public.users
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_connect_id text;

-- 2. Add listing_fee_paid column to auctions table
ALTER TABLE IF EXISTS public.auctions
  ADD COLUMN IF NOT EXISTS listing_fee_paid boolean NOT NULL DEFAULT false;

-- 3. Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON public.users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_auctions_listing_fee_paid ON public.auctions(listing_fee_paid);

-- 4. Safely add new AuctionStatus enum values if using PG enum
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AuctionStatus') THEN
    ALTER TYPE public."AuctionStatus" ADD VALUE IF NOT EXISTS 'WAITING_FOR_FEE';
    ALTER TYPE public."AuctionStatus" ADD VALUE IF NOT EXISTS 'ENDED_WAITING_PAYMENT';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;
