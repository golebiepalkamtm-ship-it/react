# Production Local Deployment Script
# Stops existing containers, builds fresh images, and deploys production environment

Write-Host "🚀 Starting Production Local Deployment..." -ForegroundColor Green

# Stop and remove existing containers
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml down --remove-orphans

# Remove existing images to ensure clean build
Write-Host "🗑️ Removing existing images..." -ForegroundColor Yellow
docker rmi champion-pigeon-auctions_frontend 2>$null
docker rmi champion-pigeon-auctions_backend 2>$null
docker rmi champion-pigeon-auctions_db-migrate 2>$null

# Build images without cache
Write-Host "🔨 Building frontend image (no-cache)..." -ForegroundColor Blue
docker-compose -f docker-compose.prod.yml build --no-cache frontend

Write-Host "🔨 Building backend image (no-cache)..." -ForegroundColor Blue
docker-compose -f docker-compose.prod.yml build --no-cache backend

Write-Host "🔨 Building migration image (no-cache)..." -ForegroundColor Blue
docker-compose -f docker-compose.prod.yml build --no-cache db-migrate

# Start database
Write-Host "🗄️ Starting PostgreSQL database..." -ForegroundColor Blue
docker-compose -f docker-compose.prod.yml up -d postgres

# Wait for database to be ready
Write-Host "⏳ Waiting for database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Run database migrations
Write-Host "🔄 Running database migrations..." -ForegroundColor Blue
docker-compose -f docker-compose.prod.yml up --abort-on-container-exit db-migrate

# Wait for migrations to complete
Write-Host "⏳ Waiting for migrations to complete..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start backend service
Write-Host "🔧 Starting backend service..." -ForegroundColor Blue
docker-compose -f docker-compose.prod.yml up -d backend

# Wait for backend to be healthy
Write-Host "⏳ Waiting for backend health check..." -ForegroundColor Yellow
$backendHealthy = $false
$attempts = 0
$maxAttempts = 30

while (-not $backendHealthy -and $attempts -lt $maxAttempts) {
    $health = docker-compose -f docker-compose.prod.yml ps backend --format "table {{.Status}}"
    if ($health -match "healthy") {
        $backendHealthy = $true
        Write-Host "✅ Backend is healthy!" -ForegroundColor Green
    } else {
        Write-Host "⏳ Backend not ready yet... (attempt $($attempts + 1)/$maxAttempts)" -ForegroundColor Yellow
        Start-Sleep -Seconds 2
        $attempts++
    }
}

if (-not $backendHealthy) {
    Write-Host "❌ Backend failed to become healthy. Check logs with: docker-compose -f docker-compose.prod.yml logs backend" -ForegroundColor Red
    exit 1
}

# Start frontend service
Write-Host "🌐 Starting frontend service..." -ForegroundColor Blue
docker-compose -f docker-compose.prod.yml up -d frontend

# Show final status
Write-Host "📊 Deployment Status:" -ForegroundColor Green
docker-compose -f docker-compose.prod.yml ps

Write-Host ""
Write-Host "🎉 Production deployment completed!" -ForegroundColor Green
Write-Host "📍 Frontend: http://localhost (port 80)" -ForegroundColor Cyan
Write-Host "📍 Backend API: http://localhost:8001/api" -ForegroundColor Cyan
Write-Host "📍 Database: localhost:5432" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔍 To view logs:" -ForegroundColor Yellow
Write-Host "   Frontend: docker-compose -f docker-compose.prod.yml logs -f frontend" -ForegroundColor Gray
Write-Host "   Backend:  docker-compose -f docker-compose.prod.yml logs -f backend" -ForegroundColor Gray
Write-Host "   Database: docker-compose -f docker-compose.prod.yml logs -f postgres" -ForegroundColor Gray
Write-Host ""
Write-Host "🛑 To stop: docker-compose -f docker-compose.prod.yml down" -ForegroundColor Yellow
