import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
    const msg = '❌ DXOS Infrastructure Error: Supabase credentials missing. Please copy .env.example to .env and set your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.';
    console.error(msg);
    throw new Error(msg);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
