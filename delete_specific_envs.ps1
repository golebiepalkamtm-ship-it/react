$envs = @(
    "STRIPE_WEBHOOK_SECRET",
    "NODE_VERSION",
    "JWT_SECRET",
    "NODE_ENV",
    "JWT_REFRESH_EXPIRES_IN",
    "JWT_EXPIRES_IN",
    "DIRECT_URL",
    "DATABASE_URL",
    "CLIENT_URL",
    "VITE_SUPABASE_PUBLISHABLE_KEY",
    "VITE_SUPABASE_URL"
)

foreach ($env in $envs) {
    Write-Host "--- Deleting $env ---"
    vercel env rm "$env" production --yes
    vercel env rm "$env" preview --yes
    vercel env rm "$env" development --yes
}
