-- Migration: Remove overly permissive RLS policies
-- Description: Remove old "Enable all users" policies that bypass RLS security

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Enable all users for auctions table" ON public.auctions;
DROP POLICY IF EXISTS "Enable all users for bids table" ON public.bids;
DROP POLICY IF EXISTS "Enable all users for payments table" ON public.payments;
DROP POLICY IF EXISTS "Enable all users for users table" ON public.users;
DROP POLICY IF EXISTS "Enable all users for watchlist table" ON public.watchlist;
