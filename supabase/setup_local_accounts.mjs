// ============================================================
// Create local dev accounts via GoTrue API (the correct way)
// Run AFTER supabase db reset to set up login-ready accounts.
// ============================================================
const SUPABASE_URL = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function createUser(email, password) {
  // Use admin API to create user (includes identity creation)
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'apikey': ANON_KEY,
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: email.split('@')[0] },
    }),
  });
  const data = await res.json();
  if (res.ok) {
    console.log(`  ✅ Created: ${email} (id: ${data.id})`);
    return data.id;
  } else {
    // If user already exists, try to get their ID
    if (data.msg?.includes('already been registered') || data.msg?.includes('already exists')) {
      console.log(`  ⏭️  Already exists: ${email}`);
      // Fetch existing user ID via login
      const loginRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': ANON_KEY,
        },
        body: JSON.stringify({ email, password }),
      });
      if (loginRes.ok) {
        const loginData = await loginRes.json();
        return loginData.user?.id;
      }
      return null;
    }
    console.error(`  ❌ Failed: ${email}:`, data.msg || JSON.stringify(data));
    return null;
  }
}

async function linkStaff(authUid, name, role) {
  // Update existing staffs record to set auth_uid, or insert new one
  const checkRes = await fetch(
    `${SUPABASE_URL}/rest/v1/staffs?auth_uid=eq.${authUid}&select=id`,
    {
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY,
      },
    }
  );
  const existing = await checkRes.json();
  
  if (existing.length > 0) {
    console.log(`  ⏭️  Staff already linked: ${name}`);
    return;
  }

  // Insert new staff
  const res = await fetch(`${SUPABASE_URL}/rest/v1/staffs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'apikey': SERVICE_KEY,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({
      name,
      role,
      auth_uid: authUid,
      is_active: true,
      allowed_apps: ['repaper-route-admin', 'repaper-route-driver', 'master-data', 'weighing-self-driver', 'weighing-admin'],
    }),
  });
  if (res.ok) {
    console.log(`  ✅ Staff linked: ${name} → ${authUid}`);
  } else {
    const err = await res.text();
    console.error(`  ❌ Staff link failed: ${name}:`, err);
  }
}

async function main() {
  console.log('=== Creating local dev accounts via GoTrue API ===\n');

  // 1. Create admin account
  console.log('1. admin@tbny.co.jp:');
  const adminId = await createUser('admin@tbny.co.jp', 'tbny1234');
  if (adminId) {
    await linkStaff(adminId, 'デモ管理者', 'admin');
  }

  // 2. Create secondary admin account
  console.log('\n2. admin@example.com:');
  const admin2Id = await createUser('admin@example.com', 'tbny1234');
  if (admin2Id) {
    await linkStaff(admin2Id, 'Admin User', 'admin');
  }

  // Verify login
  console.log('\n=== Verifying login ===');
  for (const email of ['admin@tbny.co.jp', 'admin@example.com']) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': ANON_KEY,
      },
      body: JSON.stringify({ email, password: 'tbny1234' }),
    });
    const data = await res.json();
    console.log(`  ${email}: ${res.ok ? '✅ LOGIN OK' : '❌ LOGIN FAILED: ' + data.msg}`);
  }

  console.log('\n=== Done! ===');
}

main().catch(console.error);
