ALTER TABLE public.auctions
ADD COLUMN IF NOT EXISTS listing_fee_paid BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_auctions_listing_fee_paid ON public.auctions(listing_fee_paid);
