# Railway Deployment Guide

## Backend Environment Variables
Set these in Railway dashboard for the API service:

### Database & Supabase
- `DATABASE_URL`: [Your Supabase PostgreSQL connection string]
- `SUPABASE_URL`: [Your Supabase project URL]
- `SUPABASE_SERVICE_ROLE_KEY`: [Your Supabase service role key]

### Authentication
- `JWT_SECRET`: [Your JWT secret]

### URLs
- `CLIENT_URL`: [Frontend Railway URL]

### Twilio
- `TWILIO_ACCOUNT_SID`: [Set in Railway dashboard]
- `TWILIO_AUTH_TOKEN`: [Set in Railway dashboard]
- `TWILIO_VERIFY_SERVICE_SID`: [Set in Railway dashboard]

## Frontend Environment Variables
Set these in Railway dashboard for the Frontend service:

### Supabase
- `VITE_SUPABASE_URL`: [Your Supabase project URL]
- `VITE_SUPABASE_ANON_KEY`: [Your Supabase anonymous key]

### API URLs
- `VITE_API_BASE_URL`: [Backend Railway URL]/api
- `VITE_WS_URL`: [Backend Railway URL]

## Deployment Steps

1. Push code to GitHub repository
2. Connect Railway to GitHub repository
3. Railway will automatically detect railway.toml and create two services
4. Set environment variables in Railway dashboard for both services
5. Deploy both services
6. Update CLIENT_URL in backend with actual frontend URL
7. Update VITE_API_BASE_URL and VITE_WS_URL in frontend with actual backend URL

## Health Checks
- Backend: `/api/health` endpoint on port 8001
- Frontend: Root path `/` on port 3000

## Database Migrations
Database migrations are handled by Supabase directly. No need to run migrations on Railway.
