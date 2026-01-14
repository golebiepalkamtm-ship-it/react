-- Ensure enums exist for auction domain
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AuctionStatus') THEN
    CREATE TYPE "AuctionStatus" AS ENUM ('ACTIVE', 'ENDED', 'CANCELLED');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AuctionCategory') THEN
    CREATE TYPE "AuctionCategory" AS ENUM ('RACING', 'BREEDING', 'SHOW');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Sex') THEN
    CREATE TYPE "Sex" AS ENUM ('MALE', 'FEMALE');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserRole') THEN
    CREATE TYPE "UserRole" AS ENUM ('USER_REGISTERED', 'USER_EMAIL_VERIFIED', 'USER_FULL_VERIFIED', 'ADMIN');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentStatus') THEN
    CREATE TYPE "PaymentStatus" AS ENUM ('INITIATED', 'PENDING', 'SUCCEEDED', 'FAILED', 'CANCELLED');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentProvider') THEN
    CREATE TYPE "PaymentProvider" AS ENUM ('PAYPAL', 'P24', 'STRIPE');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentType') THEN
    CREATE TYPE "PaymentType" AS ENUM ('BUY_NOW', 'LISTING_FEE', 'COMMISSION');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'NotificationType') THEN
    CREATE TYPE "NotificationType" AS ENUM ('OUTBID', 'AUCTION_WON', 'AUCTION_ENDING', 'BID_PLACED');
  END IF;
END
$$;
