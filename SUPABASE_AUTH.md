# Supabase Auth Configuration

This document explains the automated changes made and provides actionable steps to configure OAuth (Google/Facebook) and SMS (OTP) for this project.

1) What was added
- Migration: `supabase/migrations/create_profiles_sync.sql` — creates `public.profiles`, enables RLS, adds SELECT/INSERT/UPDATE/DELETE policies, and adds triggers to sync with `auth.users` (create on user creation, update role on email confirmation).

2) OAuth (Google / Facebook) — Redirect URIs and setup
- Required Redirect URIs to add in provider console:
  - Supabase callback (mandatory): `https://<your-project>.supabase.co/auth/v1/callback`
  - Client app redirect (optional/useful): `https://<your-client-url>/auth/callback` (e.g. `http://localhost:5173/auth/callback` for local dev)

- Steps:
  1. In Google Cloud Console / Facebook Developers create OAuth client and set Redirect URIs above.
  2. In Supabase Dashboard -> Authentication -> Providers -> enable the provider and paste Client ID and Client Secret.
  3. Ensure `additional_redirect_urls` in `supabase/config.toml` or in Supabase Dashboard includes your app URL if using custom redirects.

3) SMS (OTP) setup
- Choose a provider (Twilio or MessageBird). Tell me which provider you want and I will generate provider-specific instructions and a template.

- Generic steps (Twilio example):
  1. Create Twilio account and get Auth Token and SID.
  2. In `supabase/config.toml` or Supabase Dashboard -> Settings -> Auth -> SMS, configure Twilio and set secret via env (do not commit):
     - `SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN` (example variable name)
  3. SMS template example (in Supabase dashboard under Auth -> SMS templates):
     - "Your verification code is {{ .Code }}"

4) Security notes
- Do NOT store `SUPABASE_SERVICE_ROLE_KEY` in client `.env` or commit it. Keep it in `server/.env` or platform secrets.
- RLS is enabled for `profiles`, `users`, `auctions`, `bids`, `watchlists` with policies that allow users to edit only their own data. Admins can operate where explicitly allowed.

5) Running migrations locally
 - Install Supabase CLI: `npm install -g supabase`
 - Start local stack: `supabase start`
 - Apply migrations (local DB): `supabase db push` or `supabase db reset` (reset will wipe data)

6) If you want automated provider setup
- I can generate the exact provider console values for Google/Facebook (OAuth redirect URIs to copy/paste) and provide template client ID/secret placeholders for Supabase dashboard. Reply with the provider(s) you want to enable and your app hostname for redirects (e.g. `http://localhost:5173`), and whether you want me to run the migrations locally now.
