import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!url || !anonKey) {
  // In development we want a clear error if env vars are missing
   
  console.warn('Supabase environment variables are not set: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
}

export const supabaseClient = createClient(url ?? '', anonKey ?? '')

export default supabaseClient
