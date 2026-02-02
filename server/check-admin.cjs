const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
const prisma = new PrismaClient();

// Initialize Supabase Admin Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
}

async function createAdminUser() {
  try {
    console.log('Sprawdzam istniejących administratorów...');

    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, email: true, role: true, name: true }
    });

    console.log('Aktualni administratorzy:');
    console.log(admins);

    if (admins.length > 0) {
      console.log('Administrator już istnieje, ale może być uszkodzony. Usuwam i tworzę nowego...');

      // Usuń istniejącego użytkownika z bazy danych
      await prisma.user.delete({
        where: { id: admins[0].id }
      });
      console.log('Usunięto starego administratora z bazy danych');
    }

    // Teraz utwórz nowego administratora od podstaw
    console.log('Tworzę nowego administratora...');

    if (!supabase) {
      console.error('Brak konfiguracji Supabase dla tworzenia użytkownika');
      return;
    }

    const adminEmail = 'superadmin@palkamtm.pl';
    const adminPassword = 'admin123';

    // Najpierw sprawdź czy użytkownik już istnieje w Supabase Auth i usuń go
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      console.error('Błąd listowania użytkowników Supabase:', listError);
      return;
    }

    const existingUser = existingUsers.users.find(u => u.email === adminEmail);
    if (existingUser) {
      console.log('Znaleziono istniejącego użytkownika w Supabase Auth, usuwam...');
      const { error: deleteError } = await supabase.auth.admin.deleteUser(existingUser.id);
      if (deleteError) {
        console.error('Błąd usuwania użytkownika:', deleteError);
        return;
      }
      console.log('Usunięto starego użytkownika z Supabase Auth');
    }

    // Teraz utwórz nowego użytkownika w Supabase Auth
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true
    });

    if (createError) {
      console.error('Błąd tworzenia użytkownika:', createError);
      return;
    }

    // Dodaj do bazy danych z właściwym ID
    await prisma.user.create({
      data: {
        id: newUser.user.id,
        email: adminEmail,
        username: 'superadmin',
        role: 'ADMIN',
        name: 'Super Admin'
      }
    });

    console.log('✅ Administrator utworzony od nowa!');
    console.log('Email:', adminEmail);
    console.log('Hasło:', adminPassword);

  } catch (error) {
    console.error('Błąd:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
