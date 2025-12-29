# Deploying to Vercel

This repo contains a Vite React frontend and a separate `server/` Express backend.

This guide covers deploying the frontend to Vercel as a static site. The backend currently expects a long-running Node process and can be deployed separately (Render, Railway, Fly, etc.) or converted to Vercel serverless functions.

Steps to deploy frontend to Vercel
1. Push your branch to GitHub (already in this repo).
2. Go to https://vercel.com/new and import the GitHub repository.
3. For Project Settings (Build & Output):
   - Framework Preset: Other
   - Build Command: npm run build
   - Output Directory: dist
4. Add Environment Variables (in Vercel dashboard > Settings > Environment Variables):
   - VITE_SUPABASE_URL = <your supabase url>
   - VITE_SUPABASE_ANON_KEY = <your supabase anon key>
   - VITE_SITE_URL = https://your-deployed-site.vercel.app (optional)
   - VITE_AUTH_REDIRECT_URL = https://your-deployed-site.vercel.app/verify-email (optional)

Notes about the backend
- The server lives under `server/` — it requires `SUPABASE_SERVICE_ROLE_KEY` to perform admin actions. That key must never be exposed to client-side code.
- Options:
  1) Deploy backend to a separate host (Render/Railway) and set the client to call that URL.
  2) Convert server endpoints you need into Vercel Serverless Functions under `api/` and keep sensitive keys as Vercel Environment Variables (recommended if you want single-host on Vercel). This requires code changes to adapt Express to serverless handlers.

Quick local test
1. Build locally: `npm run build`
2. Preview: `npm run preview` (serves from `dist`)

If you want, I can:
- Add GitHub Action to auto-deploy to Vercel on push,
- Convert `server/` routes into Vercel serverless functions under `api/`,
- Or provide exact Vercel dashboard settings and env var list to copy.

Automatyzacja (co dodałem)
- Dodałem przykładowy GitHub Action `.github/workflows/deploy-vercel.yml` który buduje i deployuje frontend na Vercel po pushu do `main`.
- Dodałem prostą konwersję części endpointów admina do Vercel Serverless w `api/admin/*` — dzięki temu możesz trzymać admin API bez dodatknego serwera.

Wymagane tajne zmienne (ustaw w GitHub repo Settings -> Secrets oraz w Vercel):
- VERCEL_TOKEN
- VERCEL_ORG_ID
- VERCEL_PROJECT_ID
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY (tylko w Vercel/Konfiguracji serwera; NIE w kliencie)

Uwagi:
- Action wykorzystuje `amondnet/vercel-action` — potrzebuje tokena i identyfikatorów projektu organizacji.
- Serverless admin endpoints zakładają, że `SUPABASE_SERVICE_ROLE_KEY` jest ustawione jako Secret w Vercel (Runtime environment variables). Jeżeli wolisz backend na zewnętrznym hostingu (Render/Railway), usuń pliki w `api/` i skonfiguruj klienta do używania zewnętrznego URL.

