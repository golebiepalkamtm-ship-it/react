Purpose
-------
Short, focused guidance to help an AI coding agent become immediately productive in this repository.

Quick start (commands)
----------------------
- Install deps: npm install
- Start full dev stack (client + server): npm run dev
- Start only server: npm --prefix server run dev
- Build for production: npm run build

Big-picture architecture
------------------------
- Monorepo-style frontend + backend:
  - Frontend: Vite + React (root `src/`, uses `VITE_*` env vars). Key: `src/lib/supabase.ts` uses `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`.
  - Backend: Express + TypeScript in `server/` (entry `server/index.ts`, express app `server/app.ts`). Uses `dotenv` and reads env vars at runtime.
  - Data & Auth: Supabase (DB, Auth, Storage, RPC). Server talks to Supabase via REST endpoints and RPCs (service role key). Client uses the public anon key.

Key integration points & patterns
-------------------------------
- Supabase REST usage (server): `server/repositories/AuctionRepository.ts` and `server/app.ts` call `https://<SUPABASE_URL>/rest/v1/...` with headers `{ apikey, Authorization: Bearer <SERVICE_ROLE_KEY> }`.
- Supabase RPC: server RPC helper is `server/lib/supabaseRest.ts` -> `supabaseRpc` (used by `server/routes/auctions.ts` to call `place_bid_atomic`). Read `SupabaseRestError` for error shape.
- Shared contracts: `shared/contracts/*.ts` contain Zod schemas used by both client and server—validate request/response shapes before changing API.
- Repository pattern: read operations use `server/repositories/*` (e.g. `AuctionRepository`); routes in `server/routes/*` orchestrate auth, validation and call repos or RPCs.
- Websockets: `server/websocket/bidding.js` is wired in `server/index.ts` and exposed on app as `app.set('io', io)`; routes emit events via `req.app.get('io')`.
- Static fallback: some endpoints (e.g. `GET /api/breeder-meetings`) attempt Supabase first, then fall back to filesystem `public/meetings-with-breeders` or `server/data/*.json`.

Important files (one-line)
-------------------------
- `server/index.ts` — server bootstrap + websocket wiring
- `server/app.ts` — Express app, routes registration, Supabase webhook handling, static file resolution
- `server/routes/auctions.ts` — auction API endpoints (RPC-based bid placement)
- `server/repositories/AuctionRepository.ts` — reads from Supabase REST & maps DB rows to API shapes
- `server/lib/supabaseRest.ts` — helpers, `supabaseRpc` and `SupabaseRestError` parsing
- `server/lib/mappers.ts` — DB->API mapping utilities
- `shared/contracts/*.ts` — Zod schemas shared across client/server
- `src/lib/supabase.ts` — browser Supabase client wiring (VITE_* env vars)
- `public/` — static assets served by the backend (images, meetings folders)
- `render_api.env` / `render_web.env` — example deployment env files (contain secrets locally; do NOT commit real secrets)

Environment variables (where used)
---------------------------------
- Server (server/*):
  - SUPABASE_URL
  - SUPABASE_SERVICE_ROLE_KEY
  - SUPABASE_... (WEBHOOK_SECRET or SUPABASE_DB_WEBHOOK_SECRET used by webhook verifier)
  - DATABASE_URL, PORT, NODE_ENV
- Client (Vite):
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_ANON_KEY
  - VITE_API_URL, VITE_WS_URL, VITE_SITE_URL

Project-specific conventions
---------------------------
- Use shared Zod schemas in `shared/contracts` for request/response validation. When modifying endpoints, update schemas here first.
- Server talks to supabase via REST/RPC using service role key—changes to DB schema (views, RPC names) must be reflected in `AuctionRepository` and `server/routes`.
- Error handling: `SupabaseRestError` contains rawText and parsed body. Routes map Supabase messages to friendly HTTP codes (see `statusFromSupabaseError` in `server/routes/auctions.ts`). Follow that mapping when adding new RPCs.
- Rate limiting: routes use `express-rate-limit` (see auctions create/place-bid limiters). Keep consistent limits for sensitive endpoints.

Advice for AI code edits
-----------------------
- If you change a server endpoint or response shape, update `shared/contracts` Zod schema and then adjust client code that consumes it.
- Use `server/lib/supabaseRest.ts` helpers to make authenticated calls and to preserve consistent error wrapping.
- Preserve the Supabase headers pattern (apikey + Authorization Bearer service key) for server calls.
- Do not hardcode or commit secrets. Use `.env` or the provided `render_*.env` as templates and instruct users to populate their own `.env`.
- When adding features that require DB changes (new views, RPCs), document the DB object name and expected inputs/outputs in the same PR.

If anything above is incomplete or unclear (missing RPC/view names, local setup quirks), tell me what to expand and I will update this file.
