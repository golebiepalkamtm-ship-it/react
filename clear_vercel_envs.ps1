$envList = vercel env ls
$lines = $envList | Select-Object -Skip 3 | Where-Object { $_ -match '\S' }

foreach ($line in $lines) {
    if ($line -match '^\s*([A-Z0-9_]+)\s+') {
        $name = $matches[1]
        Write-Host "--- Clearing $name ---"
        
        # Try every combination that might exist
        foreach ($env in @("production", "preview", "development")) {
            # Try with and without master branch
            vercel env rm "$name" "$env" --yes
            vercel env rm "$name" "$env" "master" --yes
            vercel env rm "$name" "$env" "main" --yes
        }
    }
}
