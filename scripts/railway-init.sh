#!/usr/bin/env bash
set -euo pipefail

# Simple helper to install Railway CLI and init/link project
if [ -z "${RAILWAY_API_KEY-}" ]; then
  echo "ERROR: set RAILWAY_API_KEY as env var first"
  exit 1
fi

if ! command -v railway >/dev/null 2>&1; then
  echo "Installing Railway CLI..."
  curl -sSL https://railway.app/install.sh | sh
fi

echo "Logging into Railway..."
railway login --apiKey "$RAILWAY_API_KEY"

if [ -n "${RAILWAY_PROJECT_ID-}" ]; then
  echo "Linking to project id $RAILWAY_PROJECT_ID"
  railway link "$RAILWAY_PROJECT_ID"
else
  echo "No RAILWAY_PROJECT_ID set — running interactive 'railway init'"
  railway init
fi

echo "Done. Use 'railway up --detach' to deploy."
