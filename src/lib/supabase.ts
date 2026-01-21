import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

import type { SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;

const supabaseKey = supabasePublishableKey || supabaseAnonKey;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      debug: import.meta.env.DEV,
       storage: window.localStorage,
    },
  });
} else {
  console.warn('Missing Supabase environment variables - Supabase features will be disabled');
}

export { supabase };

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
