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
  
  users.users.forEach(u => console.log(u.email));
}

run();
