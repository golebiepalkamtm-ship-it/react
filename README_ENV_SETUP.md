# Szybkie ustawienie secretów (Vercel / Railway / GitHub)

## Vercel (frontend)
vercel env add NEXT_PUBLIC_SUPABASE_URL production "https://xyz.supabase.co"
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production "<anon_key>"
vercel env add OTEL_EXPORTER_OTLP_ENDPOINT production "https://ingest.vendor.com/v1/traces"

## Railway (backend)
railway variables set DATABASE_URL="postgresql://user:pass@host:5432/dbname"
railway variables set SUPABASE_SERVICE_ROLE_KEY="<service_role_key>"
railway variables set OTEL_EXPORTER_OTLP_ENDPOINT="https://ingest.vendor.com/v1/traces"

## GitHub (CI secrets)
gh secret set NEXT_PUBLIC_SUPABASE_ANON_KEY --body "<anon_key>"
gh secret set SUPABASE_SERVICE_ROLE_KEY --body "<service_role_key>"
gh secret set DATABASE_URL --body "<database_url>"

---

Run `node scripts/validate-envs.js` locally to verify envs before pushing.