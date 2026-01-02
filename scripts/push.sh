
#!/usr/bin/env bash
set -euo pipefail
set -x

# Usage: ./scripts/push.sh [branch-name] [commit-message] [deploy-target]
# Example: ./scripts/push.sh feat/global-particles "Add global particle trail" frontend
# Targets: frontend, backend, all

BRANCH=${1:-feat/global-particles}
MSG=${2:-"Add global particle trail and section animations"}
TARGET=${3:-all}

echo "PWD=$(pwd)"
echo "Git status:"; git status --porcelain || true

REMOTE_URL=${REMOTE_URL:-}
if [ -z "$REMOTE_URL" ]; then
  if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    REMOTE_URL=$(git remote get-url origin 2>/dev/null || true)
  fi
fi

if [ -z "$REMOTE_URL" ]; then
  echo "No remote 'origin' configured and REMOTE_URL not provided."
  echo "Add a remote or set REMOTE_URL env var, e.g.:"
  echo "  git remote add origin git@github.com:golebiepalkamtm-ship-it/champion-pigeon-auctions.git"
  echo "  or export REMOTE_URL=https://github.com/OWNER/REPO.git"
  exit 1
fi

echo "Using remote: $REMOTE_URL"

# fetch to ensure we have up-to-date refs
git fetch origin || true

# create or switch to branch
if git show-ref --verify --quiet refs/heads/"$BRANCH"; then
  git switch "$BRANCH"
else
  git switch -c "$BRANCH"
fi

git add -A
if git diff --staged --quiet; then
  echo "No changes to commit. Continuing to push branch."
else
  git commit -m "$MSG"
fi

echo "Pushing to $REMOTE_URL branch $BRANCH"
git push --set-upstream "$REMOTE_URL" "$BRANCH"

if command -v gh >/dev/null 2>&1; then
  echo "Creating pull request using gh..."
  gh pr create --title "$MSG" --body "Automated PR: $MSG" --base main --head "$BRANCH" || true
else
  echo "gh CLI not found — PR not created automatically. Create PR via GitHub web UI."
fi

# Deployment section
echo "Deployment target: $TARGET"

if [ "$TARGET" = "frontend" ] || [ "$TARGET" = "all" ]; then
  echo "🚀 Deploying frontend to Vercel..."
  if command -v vercel >/dev/null 2>&1; then
    vercel --prod
  else
    echo "⚠️  Vercel CLI not found. Please install with: npm i -g vercel"
    echo "Then run: vercel --prod"
  fi
fi

if [ "$TARGET" = "backend" ] || [ "$TARGET" = "all" ]; then
  echo "🚀 Deploying backend to Render..."
  echo "Please ensure your Render service is connected to this repository"
  echo "and environment variables are configured in Render dashboard."
  echo "Backend URL: https://champion-pigeon-auctions-backend.onrender.com"
fi

echo "✅ Done. Pushed branch $BRANCH to $REMOTE_URL"
echo "📋 Next steps:"
echo "1. Check Vercel deployment status"
echo "2. Check Render deployment status"
echo "3. Update DNS if needed"
echo "4. Test the deployed application"
