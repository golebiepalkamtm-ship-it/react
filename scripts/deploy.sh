#!/usr/bin/env bash
set -euo pipefail

# Champion Pigeon Auctions - Deployment Script
# Usage: ./scripts/deploy.sh [environment] [service]
# Example: ./scripts/deploy.sh production all
# Environments: staging, production
# Services: frontend, backend, all

ENVIRONMENT=${1:-production}
SERVICE=${2:-all}

echo "🚀 Champion Pigeon Auctions - Deployment Script"
echo "Environment: $ENVIRONMENT"
echo "Service: $SERVICE"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required tools are installed
check_dependencies() {
  echo "Checking dependencies..."

  if ! command -v node >/dev/null 2>&1; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
  fi

  if ! command -v npm >/dev/null 2>&1; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
  fi

  echo -e "${GREEN}✅ Dependencies OK${NC}"
}

# Build and test frontend
deploy_frontend() {
  echo "📦 Building frontend..."

  # Install dependencies
  npm install

  # Type check
  echo "🔍 Running type check..."
  npm run typecheck

  # Lint
  echo "🧹 Running linter..."
  npm run lint

  # Build
  echo "🔨 Building production bundle..."
  npm run build

  if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build failed - dist directory not found${NC}"
    exit 1
  fi

  echo -e "${GREEN}✅ Frontend build completed${NC}"

  # Deploy to Vercel
  if command -v vercel >/dev/null 2>&1; then
    echo "🚀 Deploying to Vercel..."
    if [ "$ENVIRONMENT" = "production" ]; then
      vercel --prod
    else
      vercel
    fi
    echo -e "${GREEN}✅ Frontend deployed to Vercel${NC}"
  else
    echo -e "${YELLOW}⚠️  Vercel CLI not found. Please deploy manually or install Vercel CLI${NC}"
    echo "Manual deployment: Run 'vercel --prod' in the project root"
  fi
}

# Build and test backend
deploy_backend() {
  echo "📦 Building backend..."

  cd server

  # Install dependencies
  npm install

  # Type check
  echo "🔍 Running backend type check..."
  npm run type-check

  # Build
  echo "🔨 Building backend..."
  npm run build

  if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Backend build failed - dist directory not found${NC}"
    exit 1
  fi

  cd ..
  echo -e "${GREEN}✅ Backend build completed${NC}"

  echo -e "${YELLOW}⚠️  Backend deployment to Render requires manual setup:${NC}"
  echo "1. Go to https://render.com"
  echo "2. Connect your GitHub repository"
  echo "3. Create a new Web Service"
  echo "4. Set build command: cd server && npm install && npm run build"
  echo "5. Set start command: cd server && npm start"
  echo "6. Configure environment variables from .env.production.example"
}

# Run database migrations
run_migrations() {
  echo "🗄️  Running database migrations..."

  if [ -f ".env.production" ]; then
    # Load production environment
    export $(grep -v '^#' .env.production | xargs)

    # Run Prisma migrations
    cd server
    npx prisma migrate deploy
    cd ..

    echo -e "${GREEN}✅ Database migrations completed${NC}"
  else
    echo -e "${YELLOW}⚠️  .env.production not found. Skipping database migrations.${NC}"
    echo "Please create .env.production from .env.production.example"
  fi
}

# Main deployment logic
main() {
  check_dependencies

  case $SERVICE in
    frontend)
      deploy_frontend
      ;;
    backend)
      deploy_backend
      run_migrations
      ;;
    all)
      deploy_frontend
      deploy_backend
      run_migrations
      ;;
    *)
      echo -e "${RED}❌ Invalid service: $SERVICE${NC}"
      echo "Valid services: frontend, backend, all"
      exit 1
      ;;
  esac

  echo ""
  echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
  echo ""
  echo "📋 Next steps:"
  echo "1. Test the deployed application"
  echo "2. Check logs for any errors"
  echo "3. Update DNS records if needed"
  echo "4. Monitor performance and errors"
}

main "$@"
