# Production Environment Fix

## Railway Environment Variables

Copy these variables to Railway dashboard:

### Database Connection
```
DATABASE_URL=postgresql://postgres.nctvwxiqzbedgcmetyal:Milosz.120588@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://postgres.nctvwxiqzbedgcmetyal:Milosz.120588@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

### Application Settings
```
NODE_ENV=production
PORT=8001
CLIENT_URL=https://www.palkamtm.pl
PRISMA_MIGRATE_DEPLOY=false
ALLOWED_ORIGINS=https://www.palkamtm.pl,https://palkamtm.pl,https://server-production-0e43.up.railway.app
```

### Supabase (replace with actual keys)
```
SUPABASE_URL=https://nctvwxiqzbedgcmetyal.supabase.co
SUPABASE_ANON_KEY=[your_anon_key]
SUPABASE_SERVICE_ROLE_KEY=[your_service_role_key]
SUPABASE_SECRET_ACCESS_KEY=[your_secret_access_key]
SUPABASE_SECRET_SECRET_KEY=[your_secret_secret_key]
SUPABASE_BUCKET=auction-media
SUPABASE_BUCKET_PUBLIC=true
```

### Security
```
JWT_SECRET=[32+_character_secret]
SESSION_SECRET=[16+_character_secret]
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
```

## Critical Notes:
1. Set `PRISMA_MIGRATE_DEPLOY=false` to prevent migration issues
2. Replace bracketed values with actual secrets
3. Ensure all Supabase keys are properly set
4. Check Railway logs after deployment
