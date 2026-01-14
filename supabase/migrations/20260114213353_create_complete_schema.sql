-- Complete schema creation
-- This migration creates all tables from scratch

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE,
  phone TEXT,
  name TEXT,
  first_name TEXT,
  last_name TEXT,
  street TEXT,
  postal_code TEXT,
  city TEXT,
  country TEXT,
  is_blocked BOOLEAN DEFAULT false,
  is_banned BOOLEAN DEFAULT false,
  blocked_until TIMESTAMPTZ,
  banned_until TIMESTAMPTZ,
  trust_score DECIMAL(3,2) DEFAULT 0.00,
  role TEXT DEFAULT 'USER_REGISTERED',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'ADMIN'));

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can insert users" ON users
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'ADMIN'));

-- Auctions table
CREATE TABLE IF NOT EXISTS auctions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'ogólna',
  current_price DECIMAL(12,2) DEFAULT 0.00,
  buy_now_price DECIMAL(12,2),
  reserve_price DECIMAL(12,2),
  end_time TIMESTAMPTZ NOT NULL,
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'ACTIVE',
  sex TEXT,
  location TEXT,
  images TEXT[],
  videos TEXT[],
  documents TEXT[],
  snipe_threshold_minutes INTEGER DEFAULT 5,
  snipe_extension_minutes INTEGER DEFAULT 5,
  min_bid_increment DECIMAL(12,2) DEFAULT 100.00,
  reserve_met BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active auctions" ON auctions
  FOR SELECT USING (status = 'ACTIVE' OR auth.uid() = seller_id OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'ADMIN'));

CREATE POLICY "Sellers can manage their auctions" ON auctions
  FOR ALL USING (auth.uid() = seller_id);

CREATE POLICY "Admins can manage all auctions" ON auctions
  FOR ALL USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'ADMIN'));

-- Bids table
CREATE TABLE IF NOT EXISTS bids (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  amount DECIMAL(12,2) NOT NULL,
  auction_id UUID REFERENCES auctions(id) ON DELETE CASCADE,
  bidder_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view bids" ON bids
  FOR SELECT USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'ADMIN') OR auth.uid() IN (SELECT seller_id FROM auctions WHERE id = auction_id) OR auth.uid() = bidder_id);

CREATE POLICY "Authenticated users can create bids" ON bids
  FOR INSERT WITH CHECK (auth.uid() = bidder_id);

-- Watchlist table
CREATE TABLE IF NOT EXISTS watchlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  auction_id UUID REFERENCES auctions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, auction_id)
);

ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own watchlist" ON watchlist
  FOR ALL USING (auth.uid() = user_id);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auction_id UUID REFERENCES auctions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  amount DECIMAL(12,2) NOT NULL,
  status TEXT DEFAULT 'INITIATED',
  provider TEXT,
  type TEXT,
  external_id TEXT,
  approval_url TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'ADMIN'));

CREATE POLICY "Users can insert own payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create admin user
INSERT INTO users (id, email, role, name) 
VALUES ('aa2ed3cc-8e51-441d-962f-8b190bf15e57', 'golebie.palka.mtm@gmail.com', 'ADMIN', 'Admin')
ON CONFLICT (id) DO UPDATE SET role = 'ADMIN';