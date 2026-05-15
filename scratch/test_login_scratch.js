import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mjaoolcjjlxwstlpdgrg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qYW9vbGNqamx4d3N0bHBkZ3JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NTk0MDQsImV4cCI6MjA4NTIzNTQwNH0.Veyu2pcnPJHK6g3wj1JsNMskCh0sxdB_JWEi0lsWoQ0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  console.log('Testing login for admin@tbny.co.jp...');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@tbny.co.jp',
    password: 'tbny1234',
  });

  if (error) {
    console.error('❌ Login failed:', error.message);
  } else {
    console.log('✅ Login successful!');
    console.log('User ID:', data.user.id);
  }
}

testLogin();
