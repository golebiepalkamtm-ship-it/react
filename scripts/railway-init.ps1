Param()

if (-not $Env:RAILWAY_API_KEY) {
    Write-Error "Set RAILWAY_API_KEY environment variable first"
    exit 1
}

if (-not (Get-Command railway -ErrorAction SilentlyContinue)) {
    Write-Output "Installing Railway CLI..."
    Invoke-Expression "& { iwr https://railway.app/install.ps1 -UseBasicParsing | iex }"
}

& railway login --apiKey $Env:RAILWAY_API_KEY

if ($Env:RAILWAY_PROJECT_ID) {
    Write-Output "Linking to project $Env:RAILWAY_PROJECT_ID"
    & railway link $Env:RAILWAY_PROJECT_ID
} else {
    Write-Output "No RAILWAY_PROJECT_ID set — running interactive 'railway init'"
    & railway init
}

Write-Output "Done. Run: railway up --detach to deploy."
