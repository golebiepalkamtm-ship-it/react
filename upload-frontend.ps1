# Upload frontend do Render
Write-Host "🚀 Upload frontend do Render..." -ForegroundColor Green

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

# Commit i push
Write-Host "📤 Commit i push zmian..." -ForegroundColor Yellow
git add .
git commit -m "Frontend update - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
git push origin main

Write-Host "✅ Frontend uploaded! Render automatycznie zbuduje nową wersję." -ForegroundColor Green
