import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Walidacja zmiennych środowiskowych
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables are missing:', {
    VITE_SUPABASE_URL: supabaseUrl ? 'present' : 'MISSING',
    VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? 'present' : 'MISSING'
  });
  // Instead of throwing, create a mock client to prevent crashes
  const mockSupabase = {
    auth: { getUser: () => Promise.resolve({ data: { user: null }, error: null }) },
    from: () => ({ select: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }) }),
    channel: () => ({ on: () => ({ subscribe: () => {} }), removeChannel: () => {} }),
  };
  export { mockSupabase as supabase };
} else {

export { mockSupabase as supabase };
} else {
  // Logowanie debugowania w trybie deweloperskim, aby pomóc w weryfikacji zmiennych środowiskowych
  if (import.meta.env.DEV) {
    console.log('Supabase Initialized:', {
      url: supabaseUrl,
      storage: 'Cookies with SameSite=Lax (for better third-party support)',
      siteUrl: import.meta.env.VITE_SITE_URL || 'window.location.origin',
    });
  }

  // Custom storage używający cookies zamiast localStorage dla lepszej obsługi third-party
  const cookieStorage = {
    getItem: (key: string): string | null => {
      try {
        const value = document.cookie
          .split('; ')
          .find(row => row.startsWith(`${key}=`))
          ?.split('=')[1];
        return value ? decodeURIComponent(value) : null;
      } catch {
        return null;
      }
    },
    setItem: (key: string, value: string): void => {
      try {
        const expires = new Date();
        expires.setTime(expires.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 dni
        document.cookie = `${key}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax; Secure`;
      } catch {
        // fallback do localStorage jeśli cookies nie działają
        localStorage.setItem(key, value);
      }
    },
    removeItem: (key: string): void => {
      try {
        document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax; Secure`;
      } catch {
        localStorage.removeItem(key);
      }
    },
  };

  // Klient Supabase z włączoną trwałością sesji
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true, // Trwałość sesji
      autoRefreshToken: true, // Automatyczne odświeżanie tokenów
      detectSessionInUrl: true, // Obsługa przekierowań OAuth
      storage: cookieStorage, // Używaj cookies zamiast localStorage
    },
  });

  export { supabase };
}

// Database types
export interface Auction {
  id: string;
  title: string;
  description: string;
  starting_price: number;
  current_price: number;
  end_time: string;
  status: 'active' | 'pending' | 'ended';
  category: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Pigeon {
  id: string;
  auction_id: string;
  name: string;
  ring_number: string;
  gender: 'male' | 'female';
  birth_year: number;
  bloodline: string;
  father_ring?: string;
  mother_ring?: string;
  race_wins: number;
  images: string[];
  pedigree_documents: string[];
}

export interface Bid {
  id: string;
  auction_id: string;
  user_id: string;
  amount: number;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}