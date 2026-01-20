-- Migration: Add missing indexes on foreign keys
-- Description: Add indexes to improve JOIN performance on foreign key columns

-- Auctions table foreign key indexes
CREATE INDEX IF NOT EXISTS idx_auctions_pigeon_id ON public.auctions(pigeon_id);
CREATE INDEX IF NOT EXISTS idx_auctions_owner_id ON public.auctions(owner_id);
CREATE INDEX IF NOT EXISTS idx_auctions_winner_id ON public.auctions(winner_id);

-- Bids table foreign key indexes
CREATE INDEX IF NOT EXISTS idx_bids_auction_id ON public.bids(auction_id);
CREATE INDEX IF NOT EXISTS idx_bids_bidder_id ON public.bids(bidder_id);

-- Payments table foreign key indexes
CREATE INDEX IF NOT EXISTS idx_payments_auction_id ON public.payments(auction_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);

-- Watchlist table foreign key indexes
CREATE INDEX IF NOT EXISTS idx_watchlist_auction_id ON public.watchlist(auction_id);

-- Watchlists table foreign key indexes (if it's a different table)
CREATE INDEX IF NOT EXISTS idx_watchlists_auction_id ON public.watchlists(auction_id);
