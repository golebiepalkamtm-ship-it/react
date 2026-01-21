#!/usr/bin/env bash
set -euo pipefail

# Reads .env.railway.example and sets variables in the linked Railway project.
# Requires RAILWAY_API_KEY and that the repository is linked to a project (railway link).

if [ -z "${RAILWAY_API_KEY-}" ]; then
  echo "ERROR: set RAILWAY_API_KEY environment variable"
  exit 1
fi

if [ ! -f .env.railway.example ]; then
  echo "ERROR: .env.railway.example not found"
  exit 1
fi

if ! command -v railway >/dev/null 2>&1; then
  echo "Installing Railway CLI..."
  curl -sSL https://railway.app/install.sh | sh
fi

railway login --apiKey "$RAILWAY_API_KEY"

echo "Setting variables from .env.railway.example (empty values will be skipped)..."
while IFS='=' read -r key value || [ -n "$key" ]; do
  # skip comments and empty lines
  [[ "$key" =~ ^# ]] && continue
  key=$(echo "$key" | xargs)
  if [ -z "$key" ]; then
    continue
  fi
  value=$(echo "${value-}" | sed 's/^ *//;s/ *$//')
  if [ -z "$value" ]; then
    echo "Skipping $key (empty value)"
    continue
  fi
  echo "Setting $key"
  railway variables set "$key" "$value" || echo "Warning: failed to set $key"
done < .env.railway.example

echo "Done. Verify variables in Railway dashboard."
