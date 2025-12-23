param(
  [string]$Branch = 'feat/global-particles',
  [string]$Message = 'Add global particle trail and section animations'
)

Write-Output "Preparing to push branch: $Branch"

function Get-RemoteUrl {
  $url = git remote get-url origin 2>$null
  return $url
}

$remote = Get-RemoteUrl
if (-not $remote) {
  Write-Output "No remote 'origin' configured. Please set remote or use REMOTE_URL env var."
  exit 1
}

git fetch origin | Out-Null

# create or switch to branch
try {
  git rev-parse --verify $Branch | Out-Null
  git switch $Branch
} catch {
  git switch -c $Branch
}

git add -A
$staged = git diff --staged --name-only
if (-not $staged) {
  Write-Output "No changes to commit. Continuing to push branch."
} else {
  git commit -m $Message
}

git push --set-upstream $remote $Branch

if (Get-Command gh -ErrorAction SilentlyContinue) {
  gh pr create --title $Message --body "Automated PR: $Message" --base main --head $Branch
} else {
  Write-Output "gh CLI not found — PR not created automatically. Create PR via GitHub web UI."
}

Write-Output "Done. Pushed branch $Branch to $remote"
param(
  [string]$Branch = 'feat/global-particles',
  [string]$Message = 'Add global particle trail and section animations'
)

Write-Host "Preparing to push branch: $Branch"

function Get-RemoteUrl {
  $url = git remote get-url origin 2>$null
  return $url
}

$remote = Get-RemoteUrl
if (-not $remote) {
  Write-Host "No remote 'origin' configured. Please set remote or use REMOTE_URL env var." -ForegroundColor Yellow
  exit 1
}

git fetch origin | Out-Null
git checkout -b $Branch

git add -A
$staged = git diff --staged --name-only
if (-not $staged) {
  Write-Host "No changes to commit. Continuing to push branch."
} else {
  git commit -m $Message
}

git push --set-upstream $remote $Branch

if (Get-Command gh -ErrorAction SilentlyContinue) {
  gh pr create --title $Message --body "Automated PR: $Message" --base main --head $Branch
} else {
  Write-Host "gh CLI not found — PR not created automatically. Create PR via GitHub web UI." -ForegroundColor Yellow
}

Write-Host "Done. Pushed branch $Branch to $remote"
