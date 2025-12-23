# PowerShell helper to start frontend and backend concurrently
# Usage: Open PowerShell in repository root and run: ./scripts/start-dev.ps1

Write-Host "Starting frontend and backend (dev)..."
# Use npm script which uses concurrently
npm run dev
