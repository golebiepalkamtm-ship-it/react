#!/usr/bin/env node
/*
Create a Supabase admin user and insert a profile row with role=ADMIN.
Usage:
  node create-admin.js --email=admin@example.com --password=StrongPass123 --name="Admin Name"

Requires env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
*/

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
  const email = args.email || process.env.ADMIN_EMAIL;
  const password = args.password || process.env.ADMIN_PASSWORD;
  const name = args.name || process.env.ADMIN_NAME || '';

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
    process.exit(1);
  }

  if (!email || !password) {
    console.error('Please provide --email and --password (or set ADMIN_EMAIL and ADMIN_PASSWORD env vars).');
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
      console.error('Failed to create auth user:', createResp.status, createBody);
      process.exit(1);
    }

    const id = createBody?.id;
    console.log('Auth user created with id:', id);

    console.log('Inserting profile row into users table...');
    const profileResp = await fetch(`${supabaseUrl}/rest/v1/users`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify({ id, email, name, role: 'ADMIN' })
    });
    const profileBody = await profileResp.json();
    if (!profileResp.ok) {
      console.error('Failed to insert profile row:', profileResp.status, profileBody);
      process.exit(1);
    }

    console.log('Profile inserted:', profileBody);
    console.log('Admin account created successfully.');
  } catch (err) {
    console.error('Error creating admin:', err);
    process.exit(1);
  }
}

main();
