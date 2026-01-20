-- Migration: Add RLS policies for bids, payments, and watchlist
-- Description: Create secure policies for tables that currently have RLS enabled but no policies

-- BIDS Table Policies
CREATE POLICY "Bids are viewable by everyone" 
  ON public.bids 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can place bids" 
  ON public.bids 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = bidder_id);

-- PAYMENTS Table Policies
-- Only users can view their own payments
CREATE POLICY "Users can view own payments"
  ON public.payments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Only authenticated users can create payments (for their own account)
CREATE POLICY "Users can create own payments"
  ON public.payments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- WATCHLIST Table Policies
CREATE POLICY "Users can view own watchlist" 
  ON public.watchlist 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to own watchlist"
  ON public.watchlist
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from own watchlist"
  ON public.watchlist
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
