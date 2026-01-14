-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  auction_id UUID REFERENCES auctions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  amount numeric(12,2) NOT NULL,
  status TEXT DEFAULT 'INITIATED' CHECK (status IN ('INITIATED', 'PENDING', 'SUCCEEDED', 'FAILED', 'CANCELLED')),
  provider TEXT CHECK (provider IN ('PAYPAL', 'P24', 'STRIPE')),
  type TEXT CHECK (type IN ('BUY_NOW', 'LISTING_FEE', 'COMMISSION')),
  external_id TEXT,
  approval_url TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'ADMIN'));

CREATE POLICY "Users can insert own payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update all payments" ON payments
  FOR UPDATE USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'ADMIN'));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_auction_id ON payments(auction_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
