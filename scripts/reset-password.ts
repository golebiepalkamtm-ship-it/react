#!/usr/bin/env tsx
import 'dotenv/config';

// Load env vars from various locations
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../server/.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../server/.env.development') });
dotenv.config({ path: path.resolve(__dirname, '../server/.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

type CliArgs = Record<string, string>;

const parseArgs = (): CliArgs => {
  return process.argv.slice(2).reduce<CliArgs>((acc, arg) => {
    const match = arg.match(/^--([^=]+)=?(.*)$/);
    if (match) {
      acc[match[1]] = match[2] || '';
    }
    return acc;
  }, {});
};

async function main() {
  const args = parseArgs();
  const email = args.email;
  const password = args.password;

  if (!email || !password) {
    console.error('❌ Podaj --email oraz --password');
    process.exit(1);
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Wymagane Zmienne środowiskowe SUPABASE_URL oraz SUPABASE_SERVICE_ROLE_KEY.');
    process.exit(1);
  }

  const adminHeaders = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
  };

  try {
    console.log(`ℹ️ Szukam użytkownika ${email}...`);
    
    // 1. Get User ID by looking up users? Or just try to create? 
    // Supabase Admin API doesn't have a simple "get user by email".
    // But we can list users with a filter.
    // Actually, create-admin.ts used `createResp` error to detect existence, but we want ID.
    // Let's use `listUsers` (GET /auth/v1/admin/users) but it might not support filtering by email in all versions.
    // Safer approach: Use the postgres database directly if we have prisma, OR just try to update blindly if we had the ID.
    // But we don't have the ID.
    
    // Let's try to query the `auth.users` via SQL if possible? No.
    // Let's rely on the `users` table alias in `prisma` or `Postgrest` if the IDs match.
    // Usually `users.id` (public) matches `auth.users.id`.
    
    // Let's try to fetch from public.users table via REST API to get the ID.
    const userResp = await fetch(`${supabaseUrl}/rest/v1/users?email=eq.${encodeURIComponent(email)}&select=id`, {
        method: 'GET',
        headers: adminHeaders
    });
    
    if (!userResp.ok) {
        console.error('❌ Błąd pobierania użytkownika z public.users:', await userResp.text());
        // Fallback: try listing auth users (unreliable pagination but worth a shot for small userbases)
    }
    
    let userId: string | undefined;
    const userJson = await userResp.json();
    if (Array.isArray(userJson) && userJson.length > 0) {
        userId = userJson[0].id;
    }

    if (!userId) {
        console.error(`❌ Nie znaleziono użytkownika ${email} w tabeli public.users.`);
        console.log('ℹ️ Próbuję znaleźć przez auth/v1/admin/users (może nie być w public)...');
        // Warning: This lists all users, might be slow if thousands.
        const authUsersResp = await fetch(`${supabaseUrl}/auth/v1/admin/users?page=1&per_page=1000`, { // Simplification
            headers: adminHeaders
        });
        const authUsersBody = await authUsersResp.json();
        if (authUsersBody.users) {
             const found = authUsersBody.users.find((u: any) => u.email === email);
             if (found) userId = found.id;
        }
    }

    if (!userId) {
        console.error('❌ Użytkownik nie istnieje.');
        process.exit(1);
    }

    console.log(`ℹ️ Znaleziono ID: ${userId}. Aktualizuję hasło...`);

    const updateResp = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
        method: 'PUT',
        headers: adminHeaders,
        body: JSON.stringify({
            password: password
        })
    });

    if (!updateResp.ok) {
        const err = await updateResp.json();
        console.error('❌ Nie udało się zaktualizować hasła:', err);
        process.exit(1);
    }

    console.log(`✅ Hasło dla ${email} zostało zaktualizowane.`);

  } catch (error) {
    console.error('❌ Błąd:', error);
    process.exit(1);
  }
}

main();
