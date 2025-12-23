
#!/usr/bin/env bash
set -euo pipefail
set -x

# Usage: ./scripts/push.sh [branch-name] [commit-message]
# Example: ./scripts/push.sh feat/global-particles "Add global particle trail"

BRANCH=${1:-feat/global-particles}
MSG=${2:-"Add global particle trail and section animations"}

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
  echo "  git remote add origin git@github.com:golebiepalkamtm-ship-it/react.git"
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

echo "Done. Pushed branch $BRANCH to $REMOTE_URL"
