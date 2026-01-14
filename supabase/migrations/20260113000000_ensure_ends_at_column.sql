-- Ensure ends_at column exists for auctions (fixes Prisma P2022 in cron)
ALTER TABLE public.auctions
  ADD COLUMN IF NOT EXISTS ends_at TIMESTAMPTZ;

-- Helpful index for ending checks
CREATE INDEX IF NOT EXISTS idx_auctions_ends_at ON public.auctions(ends_at);
