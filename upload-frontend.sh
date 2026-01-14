#!/bin/bash

echo "🚀 Upload frontend do Render..."

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

# Commit i push
echo "📤 Commit i push zmian..."
git add .
git commit -m "Frontend update - $(date)"
git push origin main

echo "✅ Frontend uploaded! Render automatycznie zbuduje nową wersję."
