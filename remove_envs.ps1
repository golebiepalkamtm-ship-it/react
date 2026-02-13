$envs = @(
    "REDIS_URL",
    "PORT",
    "VITE_API_URL_LOCAL",
    "VITE_SUPABASE_ANON_KEY",
    "VITE_SUPABASE_URL",
    "VITE_ENABLE_TRACING",
    "VITE_SUPABASE_PUBLISHABLE_KEY",
    "VITE_WS_URL",
    "SUPABASE_SECRET_ACCESS_KEY",
    "VITE_API_URL",
    "VITE_SITE_URL_LOCAL",
    "VITE_AUTH_REDIRECT_URL",
    "TWILIO_PHONE_NUMBER",
    "TWILIO_VERIFY_SERVICE_SID",
    "CLIENT_URL",
    "ALLOWED_ORIGINS"
)

foreach ($env in $envs) {
    Write-Host "Removing $env..."
    # vercel env rm returns a prompt, so we might need -y or pipes
    # But vercel CLI often doesn't have -y for rm.
    # Let's try to pipe "y" to it.
    echo "y" | vercel env rm $env production
    echo "y" | vercel env rm $env preview
    echo "y" | vercel env rm $env development
}
