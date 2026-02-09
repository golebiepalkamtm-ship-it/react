-- Extend AuctionCategory enum with SUPPLEMENTS and ACCESSORIES if missing
DO $$
BEGIN
  -- Add SUPPLEMENTS
  BEGIN
    ALTER TYPE "AuctionCategory" ADD VALUE IF NOT EXISTS 'SUPPLEMENTS';
  EXCEPTION
    WHEN duplicate_object THEN
      NULL;
  END;

  -- Add ACCESSORIES
  BEGIN
    ALTER TYPE "AuctionCategory" ADD VALUE IF NOT EXISTS 'ACCESSORIES';
  EXCEPTION
    WHEN duplicate_object THEN
      NULL;
  END;
END;
$$ LANGUAGE plpgsql;
