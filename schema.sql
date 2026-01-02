-- =====================================================
-- Champion Pigeon Auctions - Database Schema
-- PostgreSQL / Supabase
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLES
-- =====================================================

-- Auctions table
CREATE TABLE auctions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT, -- Single image URL (can be extended to JSON array)
    start_price DECIMAL(10,2) NOT NULL CHECK (start_price > 0),
    current_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bids table (immutable ledger)
CREATE TABLE bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Auctions indexes
CREATE INDEX idx_auctions_user_id ON auctions(user_id);
CREATE INDEX idx_auctions_status ON auctions(status);
CREATE INDEX idx_auctions_end_time ON auctions(end_time);
CREATE INDEX idx_auctions_created_at ON auctions(created_at DESC);

-- Bids indexes
CREATE INDEX idx_bids_auction_id ON bids(auction_id);
CREATE INDEX idx_bids_user_id ON bids(user_id);
CREATE INDEX idx_bids_created_at ON bids(created_at DESC);

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================

-- Enable RLS
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLICIES
-- =====================================================

-- Auctions policies
-- SELECT: Public (anyone can view auctions)
CREATE POLICY "auctions_select_policy" ON auctions
    FOR SELECT USING (true);

-- INSERT: Authenticated users only
CREATE POLICY "auctions_insert_policy" ON auctions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE: Only auction owner or admin
CREATE POLICY "auctions_update_policy" ON auctions
    FOR UPDATE USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- DELETE: Only admin
CREATE POLICY "auctions_delete_policy" ON auctions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Bids policies
-- SELECT: Public (anyone can view bids)
CREATE POLICY "bids_select_policy" ON bids
    FOR SELECT USING (true);

-- INSERT: Authenticated users only, user_id must match auth.uid()
CREATE POLICY "bids_insert_policy" ON bids
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE: Never (ledger style - bids are immutable)
CREATE POLICY "bids_update_policy" ON bids
    FOR UPDATE USING (false);

-- DELETE: Never (ledger style - bids are immutable)
CREATE POLICY "bids_delete_policy" ON bids
    FOR DELETE USING (false);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE id = user_uuid AND role = 'ADMIN'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current max bid for auction
CREATE OR REPLACE FUNCTION get_current_max_bid(auction_uuid UUID)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    max_bid DECIMAL(10,2);
BEGIN
    SELECT COALESCE(MAX(amount), 0) INTO max_bid
    FROM bids
    WHERE auction_id = auction_uuid;

    RETURN max_bid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger: Validate bid before insert
CREATE OR REPLACE FUNCTION validate_bid()
RETURNS TRIGGER AS $$
DECLARE
    auction_start_price DECIMAL(10,2);
    current_max_bid DECIMAL(10,2);
BEGIN
    -- Get auction start price
    SELECT start_price INTO auction_start_price
    FROM auctions
    WHERE id = NEW.auction_id;

    -- Get current max bid
    SELECT get_current_max_bid(NEW.auction_id) INTO current_max_bid;

    -- Determine minimum bid amount
    IF current_max_bid = 0 THEN
        -- First bid must be at least start_price
        IF NEW.amount < auction_start_price THEN
            RAISE EXCEPTION 'Bid amount (%.2f) must be at least the starting price (%.2f)',
                NEW.amount, auction_start_price;
        END IF;
    ELSE
        -- Subsequent bids must be higher than current max
        IF NEW.amount <= current_max_bid THEN
            RAISE EXCEPTION 'Bid amount (%.2f) must be higher than current highest bid (%.2f)',
                NEW.amount, current_max_bid;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update current_price in auctions after bid insert
CREATE OR REPLACE FUNCTION update_auction_current_price()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE auctions
    SET current_price = NEW.amount,
        updated_at = NOW()
    WHERE id = NEW.auction_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Extend auction time if bid placed in last 5 minutes
CREATE OR REPLACE FUNCTION extend_auction_time()
RETURNS TRIGGER AS $$
DECLARE
    auction_end TIMESTAMP WITH TIME ZONE;
    time_remaining INTERVAL;
BEGIN
    -- Get auction end time
    SELECT end_time INTO auction_end
    FROM auctions
    WHERE id = NEW.auction_id;

    -- Calculate time remaining
    time_remaining := auction_end - NOW();

    -- If less than 5 minutes remaining, extend by 5 minutes
    IF time_remaining < INTERVAL '5 minutes' THEN
        UPDATE auctions
        SET end_time = end_time + INTERVAL '5 minutes',
            updated_at = NOW()
        WHERE id = NEW.auction_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER ATTACHMENTS
-- =====================================================

-- Attach validate_bid trigger (BEFORE INSERT)
CREATE TRIGGER validate_bid_trigger
    BEFORE INSERT ON bids
    FOR EACH ROW EXECUTE FUNCTION validate_bid();

-- Attach update_auction_current_price trigger (AFTER INSERT)
CREATE TRIGGER update_current_price_trigger
    AFTER INSERT ON bids
    FOR EACH ROW EXECUTE FUNCTION update_auction_current_price();

-- Attach extend_auction_time trigger (AFTER INSERT)
CREATE TRIGGER extend_auction_time_trigger
    AFTER INSERT ON bids
    FOR EACH ROW EXECUTE FUNCTION extend_auction_time();

-- =====================================================
-- INITIAL DATA (Optional)
-- =====================================================

-- Insert sample auction (uncomment to test)
-- INSERT INTO auctions (user_id, title, description, start_price, end_time)
-- VALUES (
--     '00000000-0000-0000-0000-000000000000', -- Replace with actual user UUID
--     'Sample Auction',
--     'This is a sample auction for testing',
--     100.00,
--     NOW() + INTERVAL '7 days'
-- );

-- =====================================================
-- VIEWS (Optional - for easier queries)
-- =====================================================

-- View for auctions with bid count and latest bid
CREATE VIEW auctions_with_stats AS
SELECT
    a.*,
    COUNT(b.id) as bid_count,
    MAX(b.amount) as highest_bid,
    MAX(b.created_at) as last_bid_time
FROM auctions a
LEFT JOIN bids b ON a.id = b.auction_id
GROUP BY a.id;

-- =====================================================
-- END OF SCHEMA
-- =====================================================