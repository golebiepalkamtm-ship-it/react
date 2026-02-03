/* eslint-disable no-console */
const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'DATABASE_URL',
  'RAILWAY_STATIC_URL',
  'OTEL_EXPORTER_OTLP_ENDPOINT'
];
const missing = required.filter(k => !process.env[k]);
if (missing.length) {
  console.error('\nMissing required environment variables:\n  - ' + missing.join('\n  - ') + '\n\nSet them in Vercel/Railway before deploying.');
  process.exit(2);
}
console.log('All required envs present.');
