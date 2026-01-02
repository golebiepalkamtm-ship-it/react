import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Walidacja zmiennych środowiskowych
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not set: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

// Klient Supabase dla operacji po stronie klienta
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Trwałość sesji
    autoRefreshToken: true, // Automatyczne odświeżanie tokenów
    detectSessionInUrl: true, // Obsługa przekierowań OAuth
  },
});

export default supabaseClient;
