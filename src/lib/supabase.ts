import { createClient } from '@supabase/supabase-js';

// Supabase configuration using provided Project ID and Publishable Key
const supabaseUrl =
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  'https://siqjwulwewfqgbelvxrn.supabase.co';

const supabaseAnonKey =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_IJghM0O3YVbkaBKJMIg2Aw_34A60j3p';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  }
});
