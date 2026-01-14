-- Migration: Performance Indexes for Bidding System
-- Created: 2026-01-14
-- Purpose: Optimize queries for high-concurrency auction bidding

-- ============================================================================
-- BIDS TABLE INDEXES
-- ============================================================================

-- Index 1: Composite index for finding highest bid per auction (DESC order)
-- Use case: SELECT * FROM bids WHERE auction_id = ? ORDER BY amount DESC LIMIT 1
-- This is the most critical query - executed on every bid placement
CREATE INDEX IF NOT EXISTS idx_bids_auction_amount_desc 
ON bids(auction_id, amount DESC, created_at DESC);

-- Index 2: Composite index for bid history queries (ASC order for pagination)
-- Use case: SELECT * FROM bids WHERE auction_id = ? ORDER BY created_at ASC
CREATE INDEX IF NOT EXISTS idx_bids_auction_created_asc 
ON bids(auction_id, created_at ASC);

-- Index 3: User's bidding activity
-- Use case: SELECT * FROM bids WHERE bidder_id = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_bids_bidder_created_desc 
ON bids(bidder_id, created_at DESC);

-- Index 4: Proxy bidding queries
-- Use case: SELECT * FROM bids WHERE auction_id = ? AND is_proxy = true
CREATE INDEX IF NOT EXISTS idx_bids_auction_proxy 
ON bids(auction_id, is_proxy) 
WHERE is_proxy = true;

-- ============================================================================
-- AUCTIONS TABLE INDEXES
-- ============================================================================

-- Index 5: Active auctions sorted by end time (most common listing query)
-- Use case: SELECT * FROM auctions WHERE status = 'ACTIVE' ORDER BY ends_at ASC
CREATE INDEX IF NOT EXISTS idx_auctions_status_endtime 
ON auctions(status, ends_at ASC) 
WHERE status = 'ACTIVE';

-- Index 6: Auctions ending soon (for snipe protection and notifications)
-- Use case: SELECT * FROM auctions WHERE status = 'ACTIVE' AND ends_at BETWEEN ? AND ?
CREATE INDEX IF NOT EXISTS idx_auctions_active_ending_soon 
ON auctions(ends_at ASC) 
WHERE status = 'ACTIVE' AND ends_at IS NOT NULL;

-- Index 7: Category + Status filtering (common search pattern)
-- Use case: SELECT * FROM auctions WHERE category = ? AND status = 'ACTIVE'
CREATE INDEX IF NOT EXISTS idx_auctions_category_status 
ON auctions(category, status, ends_at ASC);

-- Index 8: Price range queries
-- Use case: SELECT * FROM auctions WHERE current_price BETWEEN ? AND ?
CREATE INDEX IF NOT EXISTS idx_auctions_current_price 
ON auctions(current_price) 
WHERE status = 'ACTIVE';

-- Index 9: Reserve price met filtering
-- Use case: SELECT * FROM auctions WHERE reserve_met = true AND status = 'ACTIVE'
CREATE INDEX IF NOT EXISTS idx_auctions_reserve_met 
ON auctions(reserve_met, status) 
WHERE reserve_met = true;

-- Index 10: Seller's auctions
-- Use case: SELECT * FROM auctions WHERE owner_id = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_auctions_seller_created 
ON auctions(owner_id, created_at DESC);

-- ============================================================================
-- PERFORMANCE ANALYSIS
-- ============================================================================

-- Index Justification for "Get Highest Bid" Query:
-- 
-- BEFORE (Full Table Scan):
-- SELECT * FROM bids WHERE auction_id = 'xxx' ORDER BY amount DESC LIMIT 1;
-- Cost: O(n) - scans all bids for auction, sorts in memory
-- 
-- AFTER (Index Scan with idx_bids_auction_amount_desc):
-- Cost: O(log n) - B-tree lookup directly to highest bid
-- 
-- The composite index (auction_id, amount DESC, created_at DESC) allows:
-- 1. Fast filtering by auction_id (first column)
-- 2. Pre-sorted by amount DESC (second column) - no sort needed
-- 3. Tie-breaker by created_at DESC (third column) for same amounts
-- 
-- PostgreSQL can use this index for:
-- - Index-only scans (covering index)
-- - Skip scans (jump directly to max value)
-- - Backward index scans
--
-- Expected improvement: 10-100x faster on auctions with 100+ bids

-- ============================================================================
-- MAINTENANCE
-- ============================================================================

-- Monitor index usage:
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
-- FROM pg_stat_user_indexes
-- WHERE tablename IN ('bids', 'auctions')
-- ORDER BY idx_scan DESC;

-- Check index size:
-- SELECT tablename, indexname, pg_size_pretty(pg_relation_size(indexrelid))
-- FROM pg_stat_user_indexes
-- WHERE tablename IN ('bids', 'auctions')
-- ORDER BY pg_relation_size(indexrelid) DESC;

COMMENT ON INDEX idx_bids_auction_amount_desc IS 'Critical: Optimizes highest bid lookup - most frequent query in bidding system';
COMMENT ON INDEX idx_auctions_status_endtime IS 'Optimizes active auction listings and ending soon queries';
COMMENT ON INDEX idx_bids_auction_proxy IS 'Partial index for proxy bidding - only indexes proxy bids to save space';
