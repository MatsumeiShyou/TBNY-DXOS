const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const url = process.env.VITE_SUPABASE_URL;
const roleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, roleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
  const { data: users, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) return;
  
  const user = users.users.find(u => u.email === 'admin@example.com');
  if (!user) return;
  
  const { error } = await supabase.auth.admin.updateUserById(
    user.id,
    { password: 'password123' }
  );
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Success! ID: admin@example.com, PW: password123');
  }
}

run();
