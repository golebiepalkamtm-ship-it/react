-- Fix RLS policies for References and Meetings to ensure public access
-- 1. REFERENCES
ALTER TABLE IF EXISTS "public"."references" ENABLE ROW LEVEL SECURITY;
-- detailed policy: allow public to see approved, allow authenticated/service to see all
DROP POLICY IF EXISTS "Public can view approved references" ON "public"."references";
DROP POLICY IF EXISTS "Public can view all references" ON "public"."references";
DROP POLICY IF EXISTS "Public Select References" ON "public"."references";
CREATE POLICY "Public Select References" ON "public"."references" FOR
SELECT USING (
        is_approved = true
        OR (auth.role() = 'authenticated')
        OR (auth.role() = 'service_role')
    );
-- Ensure anon and authenticated have SELECT permission
GRANT SELECT ON "public"."references" TO anon,
    authenticated;
-- 2. MEETINGS
ALTER TABLE IF EXISTS "public"."meetings" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view meetings" ON "public"."meetings";
DROP POLICY IF EXISTS "Public Select Meetings" ON "public"."meetings";
CREATE POLICY "Public Select Meetings" ON "public"."meetings" FOR
SELECT USING (true);
GRANT SELECT ON "public"."meetings" TO anon,
    authenticated;