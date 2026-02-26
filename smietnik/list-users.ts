import './env.js';
import { supabase } from './lib/db.js';

async function listUsers() {
  console.log('Fetching users...');
  if (!supabase) {
    console.error('Supabase client is not initialized');
    return;
  }
  
  // Pobierz użytkowników z publicznej tabeli users
  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, phone, role')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching users:', error);
    return;
  }

  console.table(users);
}

listUsers();
