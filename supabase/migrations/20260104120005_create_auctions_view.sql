-- supabase/migrations/create_auctions_view.sql
-- Functions and view for auctions

DO $do$
BEGIN
  EXECUTE $fn$
  CREATE OR REPLACE FUNCTION public.place_bid_atomic(
    p_auction_id uuid,
    p_bidder_id uuid,
    p_amount numeric,
    p_display_name text DEFAULT NULL
  )
  RETURNS TABLE (
    bid_id uuid,
    auction_id uuid,
    bidder_id uuid,
    amount numeric,
    created_at timestamptz,
    new_price numeric,
    was_extended boolean,
    new_ends_at timestamptz,
    reserve_met boolean
  )
  LANGUAGE plpgsql
  AS $function$
  DECLARE
    v_current_price numeric;
    v_min_increment numeric;
    v_status text;
    v_ends_at timestamptz;
    v_threshold_minutes integer;
    v_extension_minutes integer;
    v_reserve_price numeric;
    v_reserve_met boolean;
    v_now timestamptz := now();
  BEGIN
    SELECT
      a.current_price,
      COALESCE(a.min_bid_increment, 100),
      a.status,
      a.ends_at,
      COALESCE(a.snipe_threshold_minutes, 2),
      COALESCE(a.snipe_extension_minutes, 2),
      a.reserve_price
    INTO
      v_current_price,
      v_min_increment,
      v_status,
      v_ends_at,
      v_threshold_minutes,
      v_extension_minutes,
      v_reserve_price
    FROM public.auctions a
    WHERE a.id = p_auction_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Auction not found' USING ERRCODE = 'P0002';
    END IF;

    IF v_status <> 'open' THEN
      RAISE EXCEPTION 'Auction is not active' USING ERRCODE = 'P0001';
    END IF;

    IF v_ends_at IS NOT NULL AND v_ends_at <= v_now THEN
      UPDATE public.auctions SET status = 'closed' WHERE id = p_auction_id;
      RAISE EXCEPTION 'Auction is not active' USING ERRCODE = 'P0001';
    END IF;

    IF p_amount IS NULL OR p_amount <= 0 THEN
      RAISE EXCEPTION 'Invalid bid amount' USING ERRCODE = '22023';
    END IF;

    IF p_amount < (v_current_price + v_min_increment) THEN
      RAISE EXCEPTION 'Bid must be at least %', (v_current_price + v_min_increment) USING ERRCODE = '22023';
    END IF;

    was_extended := false;
    new_ends_at := v_ends_at;

    IF v_ends_at IS NOT NULL THEN
      IF (v_ends_at - v_now) <= make_interval(mins => v_threshold_minutes) THEN
        new_ends_at := v_ends_at + make_interval(mins => v_extension_minutes);
        was_extended := true;
      END IF;
    END IF;

    v_reserve_met := CASE
      WHEN v_reserve_price IS NULL THEN true
      ELSE p_amount >= v_reserve_price
    END;

    INSERT INTO public.bids (auction_id, bidder_id, amount, display_name)
    VALUES (p_auction_id, p_bidder_id, p_amount, NULLIF(BTRIM(p_display_name), ''))
    RETURNING id, auction_id, bidder_id, amount, created_at
    INTO bid_id, auction_id, bidder_id, amount, created_at;

    UPDATE public.auctions
    SET
      current_price = p_amount,
      ends_at = new_ends_at,
      reserve_met = v_reserve_met,
      updated_at = TIMEZONE('utc'::text, NOW())
    WHERE id = p_auction_id;

    new_price := p_amount;
    reserve_met := v_reserve_met;
    RETURN NEXT;
  END;
  $function$;
  $fn$;
END $do$;

DO $do$
BEGIN
  EXECUTE $fn$
  CREATE OR REPLACE FUNCTION public.close_expired_auctions()
  RETURNS integer
  LANGUAGE plpgsql
  AS $function$
  DECLARE
    v_updated integer;
  BEGIN
    UPDATE public.auctions
    SET status = 'closed', updated_at = TIMEZONE('utc'::text, NOW())
    WHERE status = 'open' AND ends_at IS NOT NULL AND ends_at <= NOW();

    GET DIAGNOSTICS v_updated = ROW_COUNT;
    RETURN v_updated;
  END;
  $function$;
  $fn$;
END $do$;

CREATE OR REPLACE VIEW public.active_auctions_summary AS
SELECT
  a.*,
  COALESCE(bids_agg.bids_count, 0) AS bids_count,
  COALESCE(watch_agg.watchlist_count, 0) AS watchlist_count,
  bids_agg.highest_bid
FROM public.auctions a
LEFT JOIN (
  SELECT
    b.auction_id,
    COUNT(*)::integer AS bids_count,
    MAX(b.amount) AS highest_bid
  FROM public.bids b
  GROUP BY b.auction_id
) bids_agg ON bids_agg.auction_id = a.id
LEFT JOIN (
  SELECT
    w.auction_id,
    COUNT(*)::integer AS watchlist_count
  FROM public.watchlists w
  GROUP BY w.auction_id
) watch_agg ON watch_agg.auction_id = a.id
WHERE a.status = 'open' AND (a.ends_at IS NULL OR a.ends_at > NOW());
