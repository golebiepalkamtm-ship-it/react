# Security remediation plan (automated + manual)

This document summarizes the Snyk findings and an actionable remediation plan. Create separate PRs for each high-priority item and link them to tickets.

## Summary (high priority)
- Upgrade vulnerable direct dependencies: **express**, **node-fetch**, **ts-node**, **zod**, **@prisma/client** (where applicable).
- Open Dependabot PRs (automated) — configured in `.github/dependabot.yml`.
- Add Snyk in CI and enable `snyk monitor` (created `.github/workflows/snyk.yml`).

## Immediate PRs to create
1. chore(deps): upgrade express, node-fetch, ts-node — run full test matrix.
2. chore(deps): upgrade zod & other validation libs.
3. chore(deps): bump prisma client (if compatible) and run prisma:generate.
4. chore(ci): enable Snyk monitor + remediate first-party findings.

## Third-party findings
- Many HIGH items originate from `node_modules` (third-party). Recommended approach:
  - Open Dependabot PRs and evaluate each; prefer minor/patch upgrades first.
  - If vendor fixes are unavailable, consider replacing the dependency or applying patches.

## Actions & commands
- Run locally:
  - npm ci && npm test
  - npx snyk code test --severity-threshold=high
  - npx snyk monitor
- Create PR (example):
  - git checkout -b chore/upgrade-express
  - npx npm-check-updates '/express|node-fetch|ts-node/' -u
  - npm ci && npm test
  - git commit -am "chore(deps): upgrade express/node-fetch/ts-node" && git push -u origin chore/upgrade-express

## CI / Deploy notes
- Add `SNYK_TOKEN`, `RAILWAY_API_KEY`, `VERCEL_TOKEN` to repository secrets (Railway/Vercel deploy workflows will run only if secrets exist).
- Do NOT enable OTLP endpoints or secrets in repo — use platform secrets.

## Priority & timeline
- P0: apply dependency upgrades that fix SSRF / ReDoS in direct deps (express/node-fetch)
- P1: enable Snyk monitor in CI and triage findings weekly
- P2: review third-party HIGH findings and plan upgrades/replacements

