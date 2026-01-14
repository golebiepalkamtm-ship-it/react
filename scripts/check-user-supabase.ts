import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../server/.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../server/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Brak SUPABASE_URL lub klucza w .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser() {
  console.log(`Checking Supabase at ${supabaseUrl}...`);
  
  // List all users in public.users to see what's in there
  const { data: allUsers, error: allUsersError } = await supabase
    .from('users')
    .select('id, email, role');

  if (allUsersError) {
    console.error('❌ Błąd podczas pobierania wszystkich użytkowników:', allUsersError);
  } else {
    console.log(`✅ Znaleziono ${allUsers?.length || 0} użytkowników w public.users:`);
    console.table(allUsers);
  }

  // Check specifically for our user
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'golebie.palka.mtm@gmail.com')
    .single();

  if (userError) {
    if (userError.code === 'PGRST116') {
      console.log('❌ Użytkownik golebie.palka.mtm@gmail.com nie znaleziony w tabeli public.users');
    } else {
      console.error('❌ Błąd podczas pobierania konkretnego użytkownika:', userError);
    }
  } else {
    console.log('✅ Dane użytkownika w public.users:');
    console.log(JSON.stringify(user, null, 2));
  }
}

checkUser();
