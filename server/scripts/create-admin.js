#!/usr/bin/env node
/*
Create a Supabase admin user and insert a profile row with role=ADMIN.
Usage:
  node create-admin.js --email=admin@example.com --password=StrongPass123 --name="Admin Name"

Requires env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
*/

import { argv } from 'node:process';
import crypto from 'node:crypto';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';

function parseArgs() {
  const out = {};
  argv.slice(2).forEach((arg) => {
    const m = arg.match(/^--([^=]+)=?(.*)$/);
    if (m) out[m[1]] = m[2] || '';
  });
  return out;
}

function makePassword() {
  return crypto.randomBytes(12).toString('base64url');
}

function loadEnvFiles() {
  const cwd = process.cwd();
  const candidates = [
    path.join(cwd, 'server', '.env.local'),
    path.join(cwd, 'server', '.env'),
    path.join(cwd, '.env.local'),
    path.join(cwd, '.env'),
  ];

  candidates.forEach((p) => {
    if (fs.existsSync(p)) {
      dotenv.config({ path: p, override: false });
    }
  });
}

async function createAuthUser({ supabaseUrl, serviceKey, email, password, name }) {
  const createResp = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      user_metadata: { name },
      email_confirm: true,
    }),
  });

  const createBody = await createResp.json().catch(() => null);
  if (!createResp.ok) {
    if (createResp.status === 401 || createResp.status === 403) {
      throw new Error(
        `Supabase rejected the admin request (${createResp.status}). ` +
          `This script requires SUPABASE_SERVICE_ROLE_KEY (not anon/publishable key).`
      );
    }

    const message = createBody?.msg || createBody?.message || JSON.stringify(createBody);
    throw new Error(`Failed to create auth user (${createResp.status}): ${message}`);
  }

  return createBody;
}

async function listAuthUsers({ supabaseUrl, serviceKey, page, perPage }) {
  const url = `${supabaseUrl}/auth/v1/admin/users?page=${page}&per_page=${perPage}`;
  const r = await fetch(url, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
  });
  const body = await r.json().catch(() => null);
  if (!r.ok) {
    const message = body?.msg || body?.message || JSON.stringify(body);
    throw new Error(`Failed to list auth users (${r.status}): ${message}`);
  }
  const users = Array.isArray(body) ? body : Array.isArray(body?.users) ? body.users : [];
  return users;
}

async function findAuthUserByEmail({ supabaseUrl, serviceKey, email }) {
  const perPage = 200;
  for (let page = 1; page <= 25; page += 1) {
    const users = await listAuthUsers({ supabaseUrl, serviceKey, page, perPage });
    const found = users.find((u) => String(u?.email || '').toLowerCase() === String(email).toLowerCase());
    if (found) return found;
    if (users.length < perPage) break;
  }
  return null;
}

async function createOrGetAuthUser({ supabaseUrl, serviceKey, email, password, name }) {
  try {
    return await createAuthUser({ supabaseUrl, serviceKey, email, password, name });
  } catch (err) {
    const message = String(err?.message || '');
    const looksLikeDuplicate =
      message.includes('(422)') ||
      message.toLowerCase().includes('already') ||
      message.toLowerCase().includes('exists');
    if (!looksLikeDuplicate) throw err;

    const existing = await findAuthUserByEmail({ supabaseUrl, serviceKey, email });
    if (!existing?.id) throw err;
    return existing;
  }
}

async function upsertRow({ supabaseUrl, serviceKey, table, row }) {
  const url = `${supabaseUrl}/rest/v1/${table}?on_conflict=id`;
  const r = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(row),
  });
  const body = await r.json().catch(() => null);
  if (!r.ok) {
    throw new Error(`Failed to upsert into ${table} (${r.status}): ${JSON.stringify(body)}`);
  }
  return body;
}

async function upsertIfTableExists({ supabaseUrl, serviceKey, table, row, required }) {
  try {
    return await upsertRow({ supabaseUrl, serviceKey, table, row });
  } catch (err) {
    const message = String(err?.message || '');
    const missingTable =
      message.includes("Could not find the table 'public.") ||
      message.includes('"PGRST205"') ||
      message.includes('Could not find the table');
    if (missingTable) {
      if (required) {
        throw new Error(
          `Brak tabeli public.${table} w Supabase. Odpal migracje z katalogu supabase/migrations (minimum: setup_security.sql).`
        );
      }

      console.warn(`Skipping ${table}: table does not exist in this Supabase project.`);
      return null;
    }
    throw err;
  }
}

async function selectSingle({ supabaseUrl, serviceKey, table, id, columns }) {
  const url = `${supabaseUrl}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}&select=${encodeURIComponent(columns)}`;
  const r = await fetch(url, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
  });
  const body = await r.json().catch(() => null);
  if (!r.ok) {
    throw new Error(`Failed to select from ${table} (${r.status}): ${JSON.stringify(body)}`);
  }
  return Array.isArray(body) ? body[0] ?? null : body;
}

async function createAccount({ supabaseUrl, serviceKey, email, password, name, role }) {
  const created = await createOrGetAuthUser({ supabaseUrl, serviceKey, email, password, name });
  const id = created?.id;
  if (!id) throw new Error('Auth user created but no id returned');

  await upsertIfTableExists({
    supabaseUrl,
    serviceKey,
    table: 'users',
    row: { id, email, name, role },
    required: true,
  });

  await upsertIfTableExists({
    supabaseUrl,
    serviceKey,
    table: 'profiles',
    row: { id, full_name: name || email, role },
    required: false,
  });

  const dbUser = await selectSingle({ supabaseUrl, serviceKey, table: 'users', id, columns: 'id,email,role' });
  if (dbUser?.role !== role) {
    console.warn(`Role mismatch for ${email}: expected=${role} got=${dbUser?.role}`);
  } else {
    console.log(`OK ${email}: role=${dbUser?.role}`);
  }

  return { id };
}

async function main() {
  const args = parseArgs();
  loadEnvFiles();

  const seedMode = args.seed === '1' || args.seed === 'true' || process.env.SEED_ACCOUNTS === '1';

  const supabaseUrl = args['supabase-url'] || process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey =
    args['service-key'] ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
    console.error('Run one of the following:');
    console.error(
      '  node server/scripts/create-admin.js --seed=1 --supabase-url=https://example.supabase.co --service-key=eyJhbGciOi...'
    );
    console.error('Or put the vars into server/.env.local and run:');
    console.error('  node server/scripts/create-admin.js --seed=1');
    process.exitCode = 1;
    return;
  }

  try {
    if (seedMode) {
      const adminEmail = args['admin-email'] || process.env.ADMIN_EMAIL || 'admin@demo.local';
      const adminPassword = args['admin-password'] || process.env.ADMIN_PASSWORD || makePassword();
      const adminName = args['admin-name'] || process.env.ADMIN_NAME || 'Admin';

      const user1Email = args['user1-email'] || process.env.USER1_EMAIL || 'user1@demo.local';
      const user1Password = args['user1-password'] || process.env.USER1_PASSWORD || makePassword();
      const user1Name = args['user1-name'] || process.env.USER1_NAME || 'User One';

      const user2Email = args['user2-email'] || process.env.USER2_EMAIL || 'user2@demo.local';
      const user2Password = args['user2-password'] || process.env.USER2_PASSWORD || makePassword();
      const user2Name = args['user2-name'] || process.env.USER2_NAME || 'User Two';

      console.log('Creating admin + 2 fully verified users...');

      const admin = await createAccount({
        supabaseUrl,
        serviceKey,
        email: adminEmail,
        password: adminPassword,
        name: adminName,
        role: 'ADMIN',
      });

      const user1 = await createAccount({
        supabaseUrl,
        serviceKey,
        email: user1Email,
        password: user1Password,
        name: user1Name,
        role: 'USER_FULL_VERIFIED',
      });

      const user2 = await createAccount({
        supabaseUrl,
        serviceKey,
        email: user2Email,
        password: user2Password,
        name: user2Name,
        role: 'USER_FULL_VERIFIED',
      });

      console.log('Created accounts:');
      console.log(`ADMIN  email=${adminEmail}  password=${adminPassword}  id=${admin.id}`);
      console.log(`USER1  email=${user1Email}  password=${user1Password}  id=${user1.id}`);
      console.log(`USER2  email=${user2Email}  password=${user2Password}  id=${user2.id}`);
      return;
    }

    const email = args.email || process.env.ADMIN_EMAIL;
    const password = args.password || process.env.ADMIN_PASSWORD;
    const name = args.name || process.env.ADMIN_NAME || '';

    if (!email || !password) {
      console.error('Please provide --email and --password (or set ADMIN_EMAIL and ADMIN_PASSWORD env vars).');
      process.exit(1);
    }

    console.log('Creating admin user...');
    const admin = await createAccount({
      supabaseUrl,
      serviceKey,
      email,
      password,
      name,
      role: 'ADMIN',
    });

    console.log(`Admin account created: email=${email} id=${admin.id}`);
  } catch (err) {
    console.error('Error creating admin:', err);
    process.exitCode = 1;
    return;
  }
}

main();
