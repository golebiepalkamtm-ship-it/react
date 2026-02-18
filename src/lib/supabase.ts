import { createClient } from "@supabase/supabase-js";

const sanitizeEnvValue = (value: string | undefined) => {
  if (!value) return value;
  const trimmed = value.trim();
  const wrapped =
    (trimmed.startsWith("`") && trimmed.endsWith("`")) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"));
  return wrapped ? trimmed.slice(1, -1).trim() : trimmed;
};

const defaultSupabaseUrl = "https://nctvwxiqzbedgcmetyal.supabase.co";
const defaultPublishableKey = "sb_publishable_5PhjleD4r27I7pK531AOBg_6MywaGyL";
const defaultAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jdHZ3eGlxemJlZGdjbWV0eWFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0Nzk2NDUsImV4cCI6MjA4MjA1NTY0NX0.A3ie8bcvSZeXclTKgMyh5L3uz_LPTjlHz95isEQ3kJQ";

const supabaseUrl =
  sanitizeEnvValue(import.meta.env.VITE_SUPABASE_URL) || defaultSupabaseUrl;
const supabaseAnonKey =
  sanitizeEnvValue(import.meta.env.VITE_SUPABASE_ANON_KEY) || defaultAnonKey;
const supabasePublishableKey =
  sanitizeEnvValue(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) ||
  defaultPublishableKey;

import type { SupabaseClient } from "@supabase/supabase-js";

let supabase: SupabaseClient | null = null;

const supabaseKey = supabaseAnonKey || supabasePublishableKey;

export const missingSupabaseEnv = [
  !supabaseUrl && "VITE_SUPABASE_URL",
  !supabaseAnonKey &&
    !supabasePublishableKey &&
    "VITE_SUPABASE_ANON_KEY lub VITE_SUPABASE_PUBLISHABLE_KEY",
].filter(Boolean) as string[];

export const isSupabaseConfigured = missingSupabaseEnv.length === 0;

if (isSupabaseConfigured && supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: "pkce",
      debug: true,
      storage: window.localStorage,
    },
    global: {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    },
  });
} else {
  console.warn(
    "Missing Supabase environment variables - Supabase features will be disabled",
  );
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
  status: "active" | "pending" | "ended";
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
  gender: "male" | "female";
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
  role: "user" | "admin";
  created_at: string;
  updated_at: string;
}
