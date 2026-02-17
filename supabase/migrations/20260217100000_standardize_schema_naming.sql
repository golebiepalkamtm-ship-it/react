-- Migration: Standardize database schema naming conventions
-- Description: Fix table and column naming inconsistencies for proper database standards

-- 1. Rename watchlist to watchlists for consistency (plural form)
ALTER TABLE IF EXISTS public.watchlist RENAME TO watchlists;

-- 2. Standardize column names to snake_case in bids table
ALTER TABLE IF EXISTS public.bids RENAME COLUMN "is_proxy" TO is_proxy;
ALTER TABLE IF EXISTS public.bids RENAME COLUMN "max_bid" TO max_bid;

-- 3. Standardize column names in references table (convert camelCase to snake_case)
ALTER TABLE IF EXISTS public.references RENAME COLUMN "breederName" TO breeder_name;
ALTER TABLE IF EXISTS public.references RENAME COLUMN "pigeonName" TO pigeon_name;
ALTER TABLE IF EXISTS public.references RENAME COLUMN "isApproved" TO is_approved;

-- 4. Add missing indexes for renamed columns
CREATE INDEX IF NOT EXISTS idx_watchlists_user_id ON public.watchlists(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlists_auction_id ON public.watchlists(auction_id);

-- 5. Update any existing constraints that reference old column names
-- (This would need to be done if there were foreign keys, but in this case the references table doesn't have FK constraints)

-- 6. Ensure all tables follow consistent naming patterns
-- Note: auction_images, auction_videos, auction_documents already follow good naming
-- Note: forum_categories, forum_topics, forum_posts already follow good naming
-- Note: saved_searches already follows good naming

-- 7. Verify and clean up any duplicate or conflicting policies
-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can manage own watchlist" ON public.watchlist;

-- Recreate policies for renamed table
DROP POLICY IF EXISTS "Users can manage own watchlist" ON public.watchlists;
CREATE POLICY "Users can manage own watchlist" ON public.watchlists
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 8. Update comments and documentation
COMMENT ON TABLE public.watchlists IS 'User watchlists for tracking favorite auctions';
COMMENT ON COLUMN public.bids.is_proxy IS 'Indicates if this is an automated proxy bid';
COMMENT ON COLUMN public.bids.max_bid IS 'Maximum amount user is willing to bid in proxy bidding';
COMMENT ON COLUMN public.references.breeder_name IS 'Name of the breeder being referenced';
COMMENT ON COLUMN public.references.pigeon_name IS 'Name of the pigeon in the reference';
COMMENT ON COLUMN public.references.is_approved IS 'Whether this reference has been approved for public display';
