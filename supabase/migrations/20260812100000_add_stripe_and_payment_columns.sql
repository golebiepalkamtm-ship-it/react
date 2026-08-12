-- Migration to add missing Stripe and payment columns/enums
-- Safe/idempotent PostgreSQL migration

-- 1. Add stripe columns to users table
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_connect_id text;

-- 2. Add listing_fee_paid column to auctions table
ALTER TABLE public.auctions
  ADD COLUMN IF NOT EXISTS listing_fee_paid boolean DEFAULT false;

-- 3. Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON public.users (stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_auctions_listing_fee_paid ON public.auctions (listing_fee_paid);

-- 4. Add AuctionStatus enum values
ALTER TYPE public."AuctionStatus" ADD VALUE IF NOT EXISTS 'WAITING_FOR_FEE';
ALTER TYPE public."AuctionStatus" ADD VALUE IF NOT EXISTS 'ENDED_WAITING_PAYMENT';
