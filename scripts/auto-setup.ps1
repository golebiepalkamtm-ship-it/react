<#
Automated setup: configures env (interactive), installs server deps, starts Supabase, starts server, starts ngrok,
and registers Twilio webhook using `register-twilio-webhook.js`.

Run from project root in PowerShell:
  ./scripts/auto-setup.ps1

This script requires: Node.js, npm, npx, supabase CLI, and ngrok installed (or will use npx ngrok).
#>

Set-StrictMode -Version Latest

function Load-DotEnv($path) {
  if (-not (Test-Path $path)) { return @{} }
  $lines = Get-Content $path | Where-Object { $_ -and ($_ -notmatch '^#') }
  $dict = @{}
  foreach ($l in $lines) {
    if ($l -match '^(.*?)=(.*)$') {
      $k = $matches[1].Trim(); $v = $matches[2].Trim('"').Trim(); $dict[$k] = $v
    }
  }
  return $dict
}

Write-Host "Auto-setup starting..."

$envPath = Join-Path (Get-Location) '.env'
if (-not (Test-Path $envPath)) {
  Write-Host ".env not found - running interactive generator..."
  & pwsh -NoProfile -NoLogo -Command "./scripts/configure-twilio-supabase.ps1"
}

if (-not (Test-Path $envPath)) { Write-Error ".env still missing. Aborting."; exit 1 }

$envVars = Load-DotEnv $envPath
foreach ($k in $envVars.Keys) { Set-Item -Path env:$k -Value $envVars[$k] }
Write-Host "Loaded env into current session."

Write-Host "Installing server dependencies..."
Push-Location server
npm install
Pop-Location

Write-Host "Starting Supabase local services (detached)..."
# Use cmd.exe /c to run npx on Windows
Start-Process -FilePath 'cmd.exe' -ArgumentList '/c','npx supabase start' -NoNewWindow
Start-Sleep -Seconds 4

Write-Host "Starting backend server (detached)..."
# Use cmd.exe /c to run npm on Windows
Start-Process -FilePath 'cmd.exe' -ArgumentList '/c','cd server && npm run dev' -NoNewWindow
Start-Sleep -Seconds 2

Write-Host "Starting ngrok (detached via npx)..."
# Use cmd.exe /c to run npx on Windows
Start-Process -FilePath 'cmd.exe' -ArgumentList '/c','npx ngrok http 8000 --log=stdout' -NoNewWindow
Write-Host "Waiting for ngrok to initialize..."
Start-Sleep -Seconds 5

$tunnelsApi = 'http://127.0.0.1:4040/api/tunnels'
$publicUrl = $null
for ($i=0; $i -lt 20; $i++) {
  try {
    $resp = Invoke-RestMethod -Method Get -Uri $tunnelsApi -ErrorAction Stop
    $https = $resp.tunnels | Where-Object { $_.public_url -like 'https:*' } | Select-Object -First 1
    if ($https) { $publicUrl = $https.public_url; break }
  } catch { }
  Start-Sleep -Seconds 2
}

if (-not $publicUrl) {
  Write-Warning "Could not discover ngrok public URL. Please run 'npx ngrok http 8000' manually and provide the https URL."
  $publicUrl = Read-Host 'Paste the ngrok https URL (e.g. https://abcd1234.ngrok.io)'
}

Write-Host "Public URL: $publicUrl"

Write-Host "Registering Twilio webhook for phone number..."
if (-not $env:TWILIO_ACCOUNT_SID -or -not $env:TWILIO_AUTH_TOKEN -or -not $env:TWILIO_PHONE_NUMBER) {
  Write-Error "Missing Twilio env vars. Ensure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER are set in .env."; exit 1
}

& node scripts/register-twilio-webhook.js $publicUrl

Write-Host "Auto-setup complete. Verify Twilio webhook in Console and test by sending SMS to your Twilio number."
