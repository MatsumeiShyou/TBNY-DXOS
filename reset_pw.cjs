const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const url = process.env.VITE_SUPABASE_URL;
const roleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, roleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
  const { data: users, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('Error listing users:', listError);
    return;
  }
  
  const user = users.users.find(u => u.email === 'operator@example.com');
  if (!user) {
    console.error('User not found!');
    return;
  }
  
  console.log('Found user:', user.id);
  
  const { data, error } = await supabase.auth.admin.updateUserById(
    user.id,
    { password: 'password123' }
  );
  
  if (error) {
    console.error('Error updating password:', error);
  } else {
    console.log('Password successfully reset to: password123');
  }
}

run();
