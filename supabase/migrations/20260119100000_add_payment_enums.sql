-- Migration: Add PaymentStatus and PaymentType enums
-- Keeps PaymentProvider as String for flexibility (new providers don't require migration)

-- 1. Create PaymentStatus enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentStatus') THEN
        CREATE TYPE "PaymentStatus" AS ENUM ('INITIATED', 'PENDING', 'SUCCEEDED', 'FAILED', 'CANCELLED');
    END IF;
END $$;

-- 2. Create PaymentType enum  
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentType') THEN
        CREATE TYPE "PaymentType" AS ENUM ('BUY_NOW', 'LISTING_FEE', 'COMMISSION');
    END IF;
END $$;

-- 3. Convert payments.status column to enum
-- First set default values for any NULLs
UPDATE payments SET status = 'INITIATED' WHERE status IS NULL;

-- Drop existing default, convert type, set new default
ALTER TABLE payments ALTER COLUMN status DROP DEFAULT;
ALTER TABLE payments ALTER COLUMN status TYPE "PaymentStatus" USING status::"PaymentStatus";
ALTER TABLE payments ALTER COLUMN status SET DEFAULT 'INITIATED'::"PaymentStatus";
ALTER TABLE payments ALTER COLUMN status SET NOT NULL;

-- 4. Convert payments.type column to enum
-- First set default values for any NULLs  
UPDATE payments SET type = 'BUY_NOW' WHERE type IS NULL;

-- Drop existing default, convert type, set new default
ALTER TABLE payments ALTER COLUMN type DROP DEFAULT;
ALTER TABLE payments ALTER COLUMN type TYPE "PaymentType" USING type::"PaymentType";
ALTER TABLE payments ALTER COLUMN type SET DEFAULT 'BUY_NOW'::"PaymentType";
ALTER TABLE payments ALTER COLUMN type SET NOT NULL;

-- 5. Add comment for documentation
COMMENT ON TYPE "PaymentStatus" IS 'Payment processing status: INITIATED->PENDING->SUCCEEDED/FAILED/CANCELLED';
COMMENT ON TYPE "PaymentType" IS 'Type of payment: BUY_NOW (auction purchase), LISTING_FEE (seller fee), COMMISSION (platform fee)';
