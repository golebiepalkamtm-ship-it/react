# Upload frontend i backend do Render
Write-Host "🚀 Upload frontend i backend do Render..." -ForegroundColor Green

# Sprawdź czy git jest czysty
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "❌ Masz niezatwierdzone zmiany w git!" -ForegroundColor Red
    git status
    exit 1
}

# Build frontend
Write-Host "📦 Budowanie frontendu..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build frontend nieudany" -ForegroundColor Red
    exit 1
}

# Build backend
Write-Host "📦 Budowanie backendu..." -ForegroundColor Yellow
Set-Location server
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build backend nieudany" -ForegroundColor Red
    exit 1
}

Set-Location ..

# Commit i push
Write-Host "📤 Commit i push zmian..." -ForegroundColor Yellow
git add .
git commit -m "Full stack update - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
git push origin main

Write-Host "✅ Frontend i backend uploaded! Render automatycznie zbuduje nowe wersje." -ForegroundColor Green
