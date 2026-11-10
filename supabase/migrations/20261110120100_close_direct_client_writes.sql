-- Migration: Stop clients from reaching auction data past the backend
--
-- The web app reads and writes auctions, bids, payments, watchlists and auction
-- media only through the Express API. That API is where the rules live: bid
-- increments, anti-sniping, the listing fee, the reserve price, the commission,
-- who may delete an auction.
--
-- State of the live database, checked on 2026-11-10 (pg_policies, table grants):
-- a signed-in user can do the same things straight through the Supabase REST API
-- with the public anon key, for example
--   * insert a bid row with any amount            (policy "Users can place bids");
--   * update their own auction - status, price, listing_fee_paid, winner_id
--                                    (policy "Users can update their own auctions");
--   * delete an auction that already has bids
--                                    (policy "Users can delete their own auctions");
--   * insert rows into payments, notifications and watchlists - these tables have
--     row level security switched off and INSERT/UPDATE/DELETE granted to
--     "authenticated" (a fake SUCCEEDED payment marks an auction as paid);
--   * read bids.max_bid (other bidders' proxy ceilings) and auctions.reserve_price,
--     the latter two even without signing in.
--
-- Table privileges are checked before RLS, so removing them closes these paths
-- whatever policies exist. Tables that do not exist in a database are skipped.
--
-- Not affected: the backend. It connects as "postgres", which owns every table
-- and has BYPASSRLS (verified), and the Supabase service_role bypasses RLS too.
-- Also untouched: the tables the frontend does use directly - users (own row,
-- see the previous migration) and references.

DO $$
DECLARE
  -- Private data: clients get no access at all, and RLS is on with no policy
  -- for them, so a privilege granted by mistake later still returns nothing.
  backend_only constant text[] := ARRAY[
    'bids', 'payments', 'audit_logs', 'messages', 'notifications',
    'saved_searches', 'watchlist', 'watchlists', 'page_views', 'metrics'
  ];
  -- Public data: clients may still read it (subject to RLS) but never write it.
  read_only constant text[] := ARRAY[
    'auctions', 'pigeon_profiles', 'pigeon', 'auction_images', 'auction_videos',
    'auction_documents', 'reviews', 'meetings'
  ];
  tbl text;
  readable_columns text;
BEGIN
  FOREACH tbl IN ARRAY backend_only LOOP
    IF to_regclass(format('public.%I', tbl)) IS NOT NULL THEN
      EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated', tbl);
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
    END IF;
  END LOOP;

  FOREACH tbl IN ARRAY read_only LOOP
    IF to_regclass(format('public.%I', tbl)) IS NOT NULL THEN
      EXECUTE format(
        'REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.%I FROM anon, authenticated',
        tbl
      );
    END IF;
  END LOOP;

  -- auctions.reserve_price is the seller's hidden minimum: readable by the
  -- backend only. Every other column stays readable.
  IF to_regclass('public.auctions') IS NOT NULL THEN
    SELECT string_agg(quote_ident(column_name), ', ' ORDER BY ordinal_position)
      INTO readable_columns
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'auctions'
      AND column_name <> 'reserve_price';

    EXECUTE 'REVOKE SELECT ON public.auctions FROM anon, authenticated';
    IF readable_columns IS NOT NULL THEN
      EXECUTE format(
        'GRANT SELECT (%s) ON public.auctions TO anon, authenticated',
        readable_columns
      );
    END IF;
  END IF;
END $$;

-- References (testimonials): any signed-in user can edit, approve or delete any
-- entry (policies references_update_policy / references_delete_policy).
-- Moderation is an admin task. Submitting a new, unapproved reference stays open
-- to everyone, as it is now (references_insert_policy).
DO $$
BEGIN
  IF to_regclass('public.references') IS NOT NULL THEN
    DROP POLICY IF EXISTS "references_update_policy" ON public.references;
    DROP POLICY IF EXISTS "references_delete_policy" ON public.references;
    DROP POLICY IF EXISTS "Authenticated users can update references" ON public.references;
    DROP POLICY IF EXISTS "Authenticated users can delete references" ON public.references;
    DROP POLICY IF EXISTS "references_update_admin" ON public.references;
    DROP POLICY IF EXISTS "references_delete_admin" ON public.references;

    CREATE POLICY "references_update_admin" ON public.references
      FOR UPDATE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.users u
          WHERE u.id = (select auth.uid()) AND u.role::text = 'ADMIN'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.users u
          WHERE u.id = (select auth.uid()) AND u.role::text = 'ADMIN'
        )
      );

    CREATE POLICY "references_delete_admin" ON public.references
      FOR DELETE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.users u
          WHERE u.id = (select auth.uid()) AND u.role::text = 'ADMIN'
        )
      );
  END IF;
END $$;
