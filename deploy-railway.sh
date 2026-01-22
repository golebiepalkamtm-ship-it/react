#!/bin/bash

# Railway Deployment Script for Champion Pigeon Auctions

echo "🚀 Starting Railway deployment process..."

# Check if git is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  You have uncommitted changes. Please commit them first."
    exit 1
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

echo "✅ Code pushed to GitHub!"
echo ""
echo "📋 Next steps:"
echo "1. Go to https://railway.app"
echo "2. Connect your GitHub repository"
echo "3. Railway will detect railway.toml and create two services:"
echo "   - 'api' (backend)"
echo "   - 'frontend' (React app)"
echo ""
echo "4. Set environment variables in Railway dashboard (see RAILWAY_DEPLOYMENT.md)"
echo "5. Deploy both services"
echo "6. Update URLs between services after deployment"
echo ""
echo "🎉 Deployment ready!"
