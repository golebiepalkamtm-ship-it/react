#!/usr/bin/env node
import 'dotenv/config';
import { argv } from 'node:process';

function parseArgs() {
  const out = {};
  argv.slice(2).forEach((arg) => {
    const m = arg.match(/^--([^=]+)=?(.*)$/);
    if (m) out[m[1]] = m[2] || '';
  });
  return out;
}

async function main() {
  const args = parseArgs();
  const email = args.email || process.env.USER_EMAIL;
  const password = args.password || process.env.USER_PASSWORD;
  const name = args.name || process.env.USER_NAME || '';
  const role = args.role || process.env.USER_ROLE || 'USER_FULL_VERIFIED';

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
    process.exit(1);
  }

  if (!email || !password) {
    console.error('Please provide --email and --password (or set USER_EMAIL and USER_PASSWORD env vars).');
    process.exit(1);
  }

  try {
    console.log('Creating auth user...');
    const createResp = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password,
        user_metadata: { name },
        email_confirm: true
      })
    });

    const createBody = await createResp.json();
    if (!createResp.ok) {
      if (createBody?.error_code === 'email_exists') {
        console.log('Auth user already exists. Updating profile by email...');
        const patchResp = await fetch(`${supabaseUrl}/rest/v1/users?email=eq.${encodeURIComponent(email)}`, {
          method: 'PATCH',
          headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation'
          },
          body: JSON.stringify({ name, role })
        });
        const patchBody = await patchResp.json();
        if (!patchResp.ok) {
          console.error('Failed to update profile row by email:', patchResp.status, patchBody);
          process.exit(1);
        }
        console.log('Profile updated:', patchBody);
        console.log('User ensured successfully.');
        return;
      } else {
        console.error('Failed to create auth user:', createResp.status, createBody);
        process.exit(1);
      }
    }

    const id = createBody?.id;
    console.log('Auth user created with id:', id);

    console.log('Upserting profile row into users table...');
    const profileResp = await fetch(`${supabaseUrl}/rest/v1/users?on_conflict=id`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation,resolution=merge-duplicates'
      },
      body: JSON.stringify({ id, email, name, role })
    });
    const profileBody = await profileResp.json();
    if (!profileResp.ok) {
      console.error('Failed to upsert profile row:', profileResp.status, profileBody);
      process.exit(1);
    }

    console.log('Profile upserted:', profileBody);
    console.log('User created successfully.');
  } catch (err) {
    console.error('Error creating user:', err);
    process.exit(1);
  }
}

main();
