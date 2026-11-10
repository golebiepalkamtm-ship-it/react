-- Migration: Lock down public.users for client-side (Supabase REST) access
--
-- Applied to the live project on 2026-11-10 as version 20261110221516
-- (through the management API, not with "supabase db push").
--
-- State of the live database, checked on 2026-11-10 (pg_policies, table grants,
-- pg_trigger):
--   * policy "Users Select Policy" (SELECT, USING true) plus a SELECT grant to
--     anon: anyone holding the public anon key can read every row of
--     public.users - e-mail, phone, postal address, payout IBAN / BLIK number,
--     Stripe ids;
--   * policies "Users can update own data" / "Users can update own profile" plus
--     an UPDATE grant, and NO trigger on the table: a signed-in user can change
--     any column of their own row, including "role" (-> ADMIN),
--     stripe_customer_id (skips the "card required to bid" check) and
--     is_banned / is_blocked (lifts an admin ban);
--   * anon and authenticated also hold INSERT, DELETE and TRUNCATE on the table.
--
-- After:
--   * clients can read and update only their own row;
--   * privileged columns change only through the backend;
--   * clients can neither insert nor delete rows.
--
-- Not affected: the Express backend (Prisma connects as the database owner),
-- the Supabase service_role, the auth triggers and the dashboard.
-- The web app keeps working: it reads the signed-in user's own row directly and
-- saves profile changes through PATCH /api/users/profile.

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 1. Privileged columns: enforced by a trigger, because RLS works per row, not per column.
--    SECURITY INVOKER on purpose: current_user is then the role of the caller
--    ("authenticated" / "anon" for the client API), not the function owner.
--    Columns are compared through jsonb so the function keeps working if a column
--    listed here does not exist in a given database.
CREATE OR REPLACE FUNCTION public.protect_user_privileged_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  protected_columns constant text[] := ARRAY[
    'id', 'email', 'role',
    'stripe_customer_id', 'stripe_connect_id', 'seller_activation_paid',
    'is_blocked', 'is_banned', 'blocked_until', 'banned_until',
    'trust_score', 'created_at'
  ];
  old_row jsonb;
  new_row jsonb;
  col text;
BEGIN
  -- Only the client-facing API roles are restricted.
  IF current_user NOT IN ('authenticated', 'anon') THEN
    RETURN NEW;
  END IF;

  old_row := to_jsonb(OLD);
  new_row := to_jsonb(NEW);

  FOREACH col IN ARRAY protected_columns LOOP
    IF (new_row -> col) IS DISTINCT FROM (old_row -> col) THEN
      RAISE EXCEPTION 'Column "%" of users cannot be changed from the client.', col
        USING ERRCODE = '42501';
    END IF;
  END LOOP;

  -- A verified phone number is what makes the account "fully verified":
  -- replacing it has to go through SMS verification (POST /api/auth/otp/verify).
  IF (old_row ->> 'role') IN ('USER_FULL_VERIFIED', 'ADMIN')
     AND (new_row -> 'phone') IS DISTINCT FROM (old_row -> 'phone') THEN
    RAISE EXCEPTION 'A verified phone number can only be changed through SMS verification.'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

-- Role triggers from earlier migrations are superseded by the function above.
-- (Neither exists in the live database any more; the drops keep a database built
-- from the migration files consistent. protect_role_change also rejected role
-- changes made by the backend, which connects without a JWT.)
DROP TRIGGER IF EXISTS protect_role_update ON public.users;
DROP TRIGGER IF EXISTS on_protect_user_role ON public.users;

DROP TRIGGER IF EXISTS protect_user_privileged_columns ON public.users;
CREATE TRIGGER protect_user_privileged_columns
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_user_privileged_columns();

-- 2. Row access. Remove every existing policy, whatever an earlier migration or
--    the dashboard called it, then create the two that the app needs.
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'users'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.users', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "users_select_own" ON public.users
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- service_role bypasses RLS anyway; kept explicit, as in the previous setup.
CREATE POLICY "service_role_all_users" ON public.users
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 3. Table privileges. anon keeps SELECT so that policies on other tables which
--    look at public.users do not start failing with "permission denied" -
--    without a policy for anon, RLS simply returns no rows to it.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.users FROM anon;
REVOKE INSERT, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.users FROM authenticated;
GRANT SELECT, UPDATE ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;
