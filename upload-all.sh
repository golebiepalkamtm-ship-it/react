#!/bin/bash

echo "🚀 Upload frontend i backend do Render..."

# Sprawdź czy git jest czysty
if [[ -n $(git status --porcelain) ]]; then
    echo "❌ Masz niezatwierdzone zmiany w git!"
    git status
    exit 1
fi

# Build frontend
echo "📦 Budowanie frontendu..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build frontend nieudany"
    exit 1
fi

# Build backend
echo "📦 Budowanie backendu..."
cd server
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build backend nieudany"
    exit 1
fi

cd ..

# Commit i push
echo "📤 Commit i push zmian..."
git add .
git commit -m "Full stack update - $(date)"
git push origin main

echo "✅ Frontend i backend uploaded! Render automatycznie zbuduje nowe wersje."
