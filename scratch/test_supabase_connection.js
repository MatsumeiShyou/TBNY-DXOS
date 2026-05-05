
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing connection to Supabase...');
  const start = Date.now();
  try {
    const { data, error } = await supabase
      .from('staffs')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Connection error:', error);
    } else {
      console.log(`Connection successful! Count: ${data === null ? 'head' : JSON.stringify(data)}`);
      console.log(`Time taken: ${Date.now() - start}ms`);
    }
  } catch (e) {
    console.error('Unexpected error:', e);
  }
}

testConnection();
