-- Wrap in a single DO block so the CLI executes one statement, avoiding the prepared-statement multi-command error.
DO $$
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
  SECURITY DEFINER
  SET search_path = public
  AS $function$
  DECLARE
    v_status text;
    v_current_price numeric;
    v_ends_at timestamptz;
    v_reserve_price numeric;
    v_reserve_met boolean;
    v_now timestamptz := now();
    v_auth_uid uuid := auth.uid();
  BEGIN
    IF v_auth_uid IS NULL THEN
      RAISE EXCEPTION 'Authentication required' USING ERRCODE = '28000';
    END IF;

    IF p_bidder_id IS NULL OR p_bidder_id <> v_auth_uid THEN
      RAISE EXCEPTION 'Invalid bidder' USING ERRCODE = '28000';
    END IF;

    IF p_amount IS NULL OR p_amount <= 0 THEN
      RAISE EXCEPTION 'Invalid bid amount' USING ERRCODE = '22023';
    END IF;

    SELECT
      a.status,
      a.current_price,
      a.ends_at,
      a.reserve_price
    INTO
      v_status,
      v_current_price,
      v_ends_at,
      v_reserve_price
    FROM public.auctions a
    WHERE a.id = p_auction_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Auction not found' USING ERRCODE = 'P0002';
    END IF;

    IF v_status <> 'open' THEN
      RAISE EXCEPTION 'Auction ended' USING ERRCODE = 'P0001';
    END IF;

    IF v_ends_at IS NOT NULL AND v_ends_at <= v_now THEN
      UPDATE public.auctions
      SET status = 'closed', updated_at = TIMEZONE('utc'::text, NOW())
      WHERE id = p_auction_id;
      RAISE EXCEPTION 'Auction ended' USING ERRCODE = 'P0001';
    END IF;

    IF p_amount <= v_current_price THEN
      RAISE EXCEPTION 'Outbid' USING ERRCODE = 'P0003';
    END IF;

    was_extended := false;
    new_ends_at := v_ends_at;

    IF v_ends_at IS NOT NULL AND (v_ends_at - v_now) <= interval '60 seconds' THEN
      new_ends_at := v_ends_at + interval '120 seconds';
      was_extended := true;
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

  EXECUTE 'REVOKE ALL ON FUNCTION public.place_bid_atomic(uuid, uuid, numeric, text) FROM PUBLIC';
  EXECUTE 'GRANT EXECUTE ON FUNCTION public.place_bid_atomic(uuid, uuid, numeric, text) TO authenticated';
END;
$$;

