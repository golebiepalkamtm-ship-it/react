# Telemetry / Tracing — setup

This project uses OpenTelemetry for tracing (dev + prod). **Do not commit secrets** — store them in Railway (backend) and Vercel (frontend).

## Quick checklist
- Local dev: run `docker compose up otel-collector` and set `.env.local` to point at `http://host.docker.internal:4318/v1/traces`.
- Backend (Railway): set `ENABLE_TRACING=true` and `OTEL_EXPORTER_OTLP_ENDPOINT` to your vendor OTLP endpoint.
- Frontend (Vercel): set `VITE_ENABLE_TRACING=true` and `VITE_OTEL_EXPORTER_ENDPOINT`.

## Recommended env vars
- OTEL_SERVICE_NAME=champion-pigeon-api
- OTEL_EXPORTER_OTLP_ENDPOINT=https://<VENDOR-OTLP-URL>/v1/traces
- ENABLE_TRACING=true
- OTEL_SAMPLER_PROBABILITY=0.01

Frontend (Vercel):
- VITE_ENABLE_TRACING=true
- VITE_OTEL_SERVICE_NAME=champion-pigeon-web
- VITE_OTEL_EXPORTER_ENDPOINT=https://<VENDOR-OTLP-URL>/v1/traces

## How to set secrets
- Railway (CLI):
  - `railway variables set OTEL_EXPORTER_OTLP_ENDPOINT=https://... --project <project>`
  - `railway variables set ENABLE_TRACING=true --project <project>`
- Vercel (CLI):
  - `vercel env add VITE_OTEL_EXPORTER_ENDPOINT production`
  - `vercel env add VITE_ENABLE_TRACING production`

## Verify locally
1. `docker compose up otel-collector`
2. Start backend and frontend locally.
3. Trigger requests (open app, hit API endpoints).
4. Check collector logs — traces are printed by the logging exporter.

## Production notes
- Do NOT run a collector on Vercel or Railway in production — send OTLP to managed vendor or to a central collector.
- Use sampling in production (0.01–0.05) to control cost and volume.

## Security
- Never store secrets in git. Use platform env variables.
- Scrub or avoid PII in span attributes.

## Troubleshooting
- If no spans appear: ensure env var `ENABLE_TRACING=true` and correct OTLP endpoint.
- For local Docker -> use `host.docker.internal` on macOS/Windows.
