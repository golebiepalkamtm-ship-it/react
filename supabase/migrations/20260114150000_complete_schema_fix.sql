-- Migration: Complete Schema Fix
-- Synchronizes database with Prisma schema

-- ============================================
-- 1. USERS TABLE - Ensure all columns exist
-- ============================================
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS street TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'USER_REGISTERED',
ADD COLUMN IF NOT EXISTS trust_score NUMERIC(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ============================================
-- 2. AUCTIONS TABLE - Ensure all columns exist
-- ============================================
ALTER TABLE public.auctions 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS starting_price NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS current_price NUMERIC(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS buy_now_price NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS reserve_price NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS starts_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS snipe_threshold_minutes INT DEFAULT 5,
ADD COLUMN IF NOT EXISTS snipe_extension_minutes INT DEFAULT 5,
ADD COLUMN IF NOT EXISTS min_bid_increment INT DEFAULT 100,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS reserve_met BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'racing',
ADD COLUMN IF NOT EXISTS sex TEXT DEFAULT 'male',
ADD COLUMN IF NOT EXISTS age INT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS winner_id UUID,
ADD COLUMN IF NOT EXISTS owner_id UUID;

-- Foreign keys for auctions
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'auctions_owner_id_fkey') THEN
    ALTER TABLE public.auctions ADD CONSTRAINT auctions_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'auctions_winner_id_fkey') THEN
    ALTER TABLE public.auctions ADD CONSTRAINT auctions_winner_id_fkey FOREIGN KEY (winner_id) REFERENCES public.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================
-- 3. BIDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.bids (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  auction_id UUID NOT NULL,
  bidder_id UUID,
  amount NUMERIC(12,2) NOT NULL,
  is_proxy BOOLEAN DEFAULT false,
  max_bid NUMERIC(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'bids_auction_id_fkey') THEN
    ALTER TABLE public.bids ADD CONSTRAINT bids_auction_id_fkey FOREIGN KEY (auction_id) REFERENCES public.auctions(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'bids_bidder_id_fkey') THEN
    ALTER TABLE public.bids ADD CONSTRAINT bids_bidder_id_fkey FOREIGN KEY (bidder_id) REFERENCES public.users(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_bids_auction_id_created_at ON public.bids(auction_id, created_at);
CREATE INDEX IF NOT EXISTS idx_bids_bidder_id ON public.bids(bidder_id);

-- ============================================
-- 4. WATCHLISTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.watchlists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  auction_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, auction_id)
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'watchlists_user_id_fkey') THEN
    ALTER TABLE public.watchlists ADD CONSTRAINT watchlists_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'watchlists_auction_id_fkey') THEN
    ALTER TABLE public.watchlists ADD CONSTRAINT watchlists_auction_id_fkey FOREIGN KEY (auction_id) REFERENCES public.auctions(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_watchlists_user_id ON public.watchlists(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlists_auction_id ON public.watchlists(auction_id);

-- ============================================
-- 5. PIGEON_PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.pigeon_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  auction_id UUID UNIQUE,
  ringnumber TEXT,
  construction TEXT,
  eye_color TEXT,
  feather_color TEXT,
  vitality TEXT,
  length TEXT,
  endurance TEXT,
  fork_strength TEXT,
  fork_alignment TEXT,
  muscles TEXT,
  balance TEXT,
  back TEXT,
  purpose TEXT,
  gender TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rename bloodline to ringnumber if bloodline exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pigeon_profiles' AND column_name = 'bloodline') THEN
    ALTER TABLE public.pigeon_profiles RENAME COLUMN bloodline TO ringnumber;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pigeon_profiles' AND column_name = 'achievements') THEN
    ALTER TABLE public.pigeon_profiles RENAME COLUMN achievements TO construction;
  END IF;
END $$;

-- Ensure ringnumber column exists
ALTER TABLE public.pigeon_profiles ADD COLUMN IF NOT EXISTS ringnumber TEXT;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'pigeon_profiles_auction_id_fkey') THEN
    ALTER TABLE public.pigeon_profiles ADD CONSTRAINT pigeon_profiles_auction_id_fkey FOREIGN KEY (auction_id) REFERENCES public.auctions(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_pigeon_profiles_auction_id ON public.pigeon_profiles(auction_id);

-- ============================================
-- 6. AUCTION_IMAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.auction_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  auction_id UUID,
  url TEXT NOT NULL,
  ordering INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'auction_images_auction_id_fkey') THEN
    ALTER TABLE public.auction_images ADD CONSTRAINT auction_images_auction_id_fkey FOREIGN KEY (auction_id) REFERENCES public.auctions(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_auction_images_auction_id ON public.auction_images(auction_id);

-- ============================================
-- 7. AUCTION_VIDEOS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.auction_videos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  auction_id UUID,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'auction_videos_auction_id_fkey') THEN
    ALTER TABLE public.auction_videos ADD CONSTRAINT auction_videos_auction_id_fkey FOREIGN KEY (auction_id) REFERENCES public.auctions(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_auction_videos_auction_id ON public.auction_videos(auction_id);

-- ============================================
-- 8. AUCTION_DOCUMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.auction_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  auction_id UUID,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'auction_documents_auction_id_fkey') THEN
    ALTER TABLE public.auction_documents ADD CONSTRAINT auction_documents_auction_id_fkey FOREIGN KEY (auction_id) REFERENCES public.auctions(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_auction_documents_auction_id ON public.auction_documents(auction_id);

-- ============================================
-- 9. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  auction_id UUID,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'notifications_user_id_fkey') THEN
    ALTER TABLE public.notifications ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'notifications_auction_id_fkey') THEN
    ALTER TABLE public.notifications ADD CONSTRAINT notifications_auction_id_fkey FOREIGN KEY (auction_id) REFERENCES public.auctions(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_auction_id ON public.notifications(auction_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

-- ============================================
-- 10. REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  auction_id UUID NOT NULL,
  reviewer_id UUID NOT NULL,
  reviewee_id UUID NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(auction_id, reviewer_id)
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'reviews_auction_id_fkey') THEN
    ALTER TABLE public.reviews ADD CONSTRAINT reviews_auction_id_fkey FOREIGN KEY (auction_id) REFERENCES public.auctions(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'reviews_reviewer_id_fkey') THEN
    ALTER TABLE public.reviews ADD CONSTRAINT reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'reviews_reviewee_id_fkey') THEN
    ALTER TABLE public.reviews ADD CONSTRAINT reviews_reviewee_id_fkey FOREIGN KEY (reviewee_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_reviews_auction_id ON public.reviews(auction_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON public.reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON public.reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);

-- ============================================
-- 11. SAVED_SEARCHES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.saved_searches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  filters JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'saved_searches_user_id_fkey') THEN
    ALTER TABLE public.saved_searches ADD CONSTRAINT saved_searches_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON public.saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_is_active ON public.saved_searches(is_active);

-- ============================================
-- 12. AUCTIONS INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_auctions_status ON public.auctions(status);
CREATE INDEX IF NOT EXISTS idx_auctions_ends_at ON public.auctions(ends_at);
CREATE INDEX IF NOT EXISTS idx_auctions_category ON public.auctions(category);
CREATE INDEX IF NOT EXISTS idx_auctions_winner_id ON public.auctions(winner_id);
CREATE INDEX IF NOT EXISTS idx_auctions_owner_id ON public.auctions(owner_id);

-- ============================================
-- 13. ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pigeon_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 14. RLS POLICIES
-- ============================================

-- Users policies
DROP POLICY IF EXISTS "Users can view all users" ON public.users;
CREATE POLICY "Users can view all users" ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Auctions policies
DROP POLICY IF EXISTS "Anyone can view auctions" ON public.auctions;
CREATE POLICY "Anyone can view auctions" ON public.auctions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create auctions" ON public.auctions;
CREATE POLICY "Authenticated users can create auctions" ON public.auctions FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can update auctions" ON public.auctions;
CREATE POLICY "Owners can update auctions" ON public.auctions FOR UPDATE USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can delete auctions" ON public.auctions;
CREATE POLICY "Owners can delete auctions" ON public.auctions FOR DELETE USING (auth.uid() = owner_id);

-- Bids policies
DROP POLICY IF EXISTS "Anyone can view bids" ON public.bids;
CREATE POLICY "Anyone can view bids" ON public.bids FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create bids" ON public.bids;
CREATE POLICY "Authenticated users can create bids" ON public.bids FOR INSERT WITH CHECK (auth.uid() = bidder_id);

-- Watchlists policies
DROP POLICY IF EXISTS "Users can view own watchlist" ON public.watchlists;
CREATE POLICY "Users can view own watchlist" ON public.watchlists FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can add to watchlist" ON public.watchlists;
CREATE POLICY "Users can add to watchlist" ON public.watchlists FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove from watchlist" ON public.watchlists;
CREATE POLICY "Users can remove from watchlist" ON public.watchlists FOR DELETE USING (auth.uid() = user_id);

-- Pigeon profiles policies
DROP POLICY IF EXISTS "Anyone can view pigeon profiles" ON public.pigeon_profiles;
CREATE POLICY "Anyone can view pigeon profiles" ON public.pigeon_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owners can manage pigeon profiles" ON public.pigeon_profiles;
CREATE POLICY "Owners can manage pigeon profiles" ON public.pigeon_profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.auctions a WHERE a.id = auction_id AND a.owner_id = auth.uid())
);

-- Auction images policies
DROP POLICY IF EXISTS "Anyone can view auction images" ON public.auction_images;
CREATE POLICY "Anyone can view auction images" ON public.auction_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owners can manage auction images" ON public.auction_images;
CREATE POLICY "Owners can manage auction images" ON public.auction_images FOR ALL USING (
  EXISTS (SELECT 1 FROM public.auctions a WHERE a.id = auction_id AND a.owner_id = auth.uid())
);

-- Auction videos policies
DROP POLICY IF EXISTS "Anyone can view auction videos" ON public.auction_videos;
CREATE POLICY "Anyone can view auction videos" ON public.auction_videos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owners can manage auction videos" ON public.auction_videos;
CREATE POLICY "Owners can manage auction videos" ON public.auction_videos FOR ALL USING (
  EXISTS (SELECT 1 FROM public.auctions a WHERE a.id = auction_id AND a.owner_id = auth.uid())
);

-- Auction documents policies
DROP POLICY IF EXISTS "Anyone can view auction documents" ON public.auction_documents;
CREATE POLICY "Anyone can view auction documents" ON public.auction_documents FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owners can manage auction documents" ON public.auction_documents;
CREATE POLICY "Owners can manage auction documents" ON public.auction_documents FOR ALL USING (
  EXISTS (SELECT 1 FROM public.auctions a WHERE a.id = auction_id AND a.owner_id = auth.uid())
);

-- Notifications policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own notifications" ON public.notifications;
CREATE POLICY "Users can manage own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- Reviews policies
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = reviewer_id);

-- Saved searches policies
DROP POLICY IF EXISTS "Users can view own saved searches" ON public.saved_searches;
CREATE POLICY "Users can view own saved searches" ON public.saved_searches FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own saved searches" ON public.saved_searches;
CREATE POLICY "Users can manage own saved searches" ON public.saved_searches FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 15. UPDATE TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY['users', 'auctions', 'pigeon_profiles', 'notifications', 'reviews', 'saved_searches'])
  LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = t || '_updated_at_trigger') THEN
      EXECUTE format('CREATE TRIGGER %I_updated_at_trigger BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t, t);
    END IF;
  END LOOP;
END $$;

-- Done!
