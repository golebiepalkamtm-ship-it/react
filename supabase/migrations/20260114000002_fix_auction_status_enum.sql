-- Fix auction status enum to match Prisma schema
-- This migration ensures consistency between Prisma and Supabase

-- First, update existing data to use uppercase values
UPDATE auctions 
SET status = 'ACTIVE' 
WHERE status = 'active' OR status = 'open';

UPDATE auctions 
SET status = 'ENDED' 
WHERE status = 'ended' OR status = 'closed';

UPDATE auctions 
SET status = 'CANCELLED' 
WHERE status = 'cancelled' OR status = 'draft';

-- Drop the existing check constraint
ALTER TABLE auctions DROP CONSTRAINT IF EXISTS auctions_status_check;

-- Add new check constraint with uppercase values
ALTER TABLE auctions 
ADD CONSTRAINT auctions_status_check 
CHECK (status IN ('ACTIVE', 'ENDED', 'CANCELLED'));

-- Update the default value
ALTER TABLE auctions 
ALTER COLUMN status DROP DEFAULT;

ALTER TABLE auctions 
ALTER COLUMN status SET DEFAULT 'ACTIVE';
