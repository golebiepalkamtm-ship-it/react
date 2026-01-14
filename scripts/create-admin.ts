#!/usr/bin/env tsx
import 'dotenv/config';

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

const sanitizeUsername = (input: string) => {
  if (!input) return '';
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 32);
};

async function main() {
  const args = parseArgs();

  const email = args.email || process.env.ADMIN_EMAIL || '';
  const password = args.password || process.env.ADMIN_PASSWORD || '';
  const name = args.name || process.env.ADMIN_NAME || 'Administrator';
  const usernameArg = args.username || process.env.ADMIN_USERNAME;

  if (!email || !password) {
    console.error('❌ Podaj --email oraz --password (lub ustaw ADMIN_EMAIL / ADMIN_PASSWORD).');
    process.exit(1);
  }

  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    '';
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    '';

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Wymagane SUPABASE_URL oraz SUPABASE_SERVICE_ROLE_KEY.');
    process.exit(1);
  }

  const adminHeaders = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
  };

  const profileHeaders = {
    ...adminHeaders,
    Prefer: 'return=representation,resolution=merge-duplicates',
  };

  const username =
    sanitizeUsername(usernameArg || email.split('@')[0]) ||
    `admin-${Date.now().toString(36)}`;

  try {
    console.log(`ℹ️ Tworzę użytkownika auth ${email}...`);

    const createResp = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        email,
        password,
        user_metadata: { name },
        email_confirm: true,
      }),
    });

    const createBody = await createResp.json().catch(() => ({}));

    if (!createResp.ok && createBody?.error_code !== 'email_exists') {
      console.error('❌ Nie udało się utworzyć użytkownika auth:', createBody);
      process.exit(1);
    }

    if (createBody?.error_code === 'email_exists') {
      console.log('ℹ️ Użytkownik istnieje. Aktualizuję profil i rolę...');
      await updateProfileByEmail({
        supabaseUrl,
        headers: profileHeaders,
        email,
        name,
        username,
      });
      console.log('✅ Konto ADMIN zostało zapewnione.');
      return;
    }

    const userId = createBody?.id;
    if (!userId) {
      console.error('❌ Brak identyfikatora użytkownika w odpowiedzi Supabase.');
      process.exit(1);
    }

    console.log(`ℹ️ Auth user utworzony (id: ${userId}). Upsert profilu...`);
    const upsertBody = {
      id: userId,
      email,
      name,
      username,
      role: 'ADMIN',
    };

    const profileResp = await fetch(
      `${supabaseUrl}/rest/v1/users?on_conflict=id`,
      {
        method: 'POST',
        headers: profileHeaders,
        body: JSON.stringify(upsertBody),
      },
    );

    const profileJson = await profileResp.json().catch(() => ({}));
    if (!profileResp.ok) {
      console.error('❌ Nie udało się utworzyć profilu:', profileJson);
      process.exit(1);
    }

    console.log('✅ Admin utworzony i zapisany w tabeli users.');
  } catch (error) {
    console.error('❌ Błąd podczas tworzenia konta ADMIN:', error);
    process.exit(1);
  }
}

async function updateProfileByEmail({
  supabaseUrl,
  headers,
  email,
  name,
  username,
}: {
  supabaseUrl: string;
  headers: Record<string, string>;
  email: string;
  name: string;
  username: string;
}) {
  const url = new URL(`${supabaseUrl}/rest/v1/users`);
  url.searchParams.set('email', `eq.${encodeURIComponent(email)}`);

  const patchResp = await fetch(url, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ name, role: 'ADMIN', username }),
  });

  const patchBody = await patchResp.json().catch(() => ({}));

  if (!patchResp.ok) {
    console.error('❌ Nie udało się zaktualizować profilu:', patchBody);
    process.exit(1);
  }
}

main();
