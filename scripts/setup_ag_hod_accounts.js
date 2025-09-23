const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupAccounts() {
  console.log('🔧 Setting up AG and HOD Test Accounts\n');
  console.log('='*60);

  // 1. Check/Create AG account
  console.log('\n📝 Setting up AG Account...\n');

  const agEmail = 'ag@ag.go.ke';
  const agPassword = 'ke.12345678.AG'; // Using a standard ID format

  // Check if AG user exists
  const { data: existingAG } = await supabase
    .from('users')
    .select('id')
    .eq('email', agEmail)
    .single();

  if (existingAG) {
    // Update password
    const { error } = await supabase.auth.admin.updateUserById(
      existingAG.id,
      { password: agPassword }
    );

    if (!error) {
      console.log('✅ AG account password updated');
    }
  } else {
    // Create AG account
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: agEmail,
      password: agPassword,
      email_confirm: true,
      user_metadata: {
        full_name: 'Attorney General'
      }
    });

    if (!authError && authData.user) {
      // Create profile
      await supabase.from('users').insert({
        id: authData.user.id,
        email: agEmail,
        full_name: 'Attorney General',
        county: 'NAIROBI',
        category: 'AG'
      });

      console.log('✅ AG account created');
    }
  }

  // 2. Update HOD Test Account
  console.log('\n📝 Setting up HOD Account...\n');

  const hodEmail = 'hod.test@ag.go.ke';
  const hodPassword = 'ke.87654321.AG'; // Using a standard ID format

  // Check if HOD test user exists
  const { data: existingHOD } = await supabase
    .from('users')
    .select('id')
    .eq('email', hodEmail)
    .single();

  if (existingHOD) {
    // Update password
    const { error } = await supabase.auth.admin.updateUserById(
      existingHOD.id,
      { password: hodPassword }
    );

    if (!error) {
      console.log('✅ HOD account password updated');
    }
  } else {
    // Create HOD account
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: hodEmail,
      password: hodPassword,
      email_confirm: true,
      user_metadata: {
        full_name: 'Test HOD User'
      }
    });

    if (!authError && authData.user) {
      // Create profile
      await supabase.from('users').insert({
        id: authData.user.id,
        email: hodEmail,
        full_name: 'Test HOD User',
        county: 'NAIROBI',
        department_saga_id: 21, // International Law Division
        category: 'HOD'
      });

      console.log('✅ HOD account created');
    }
  }

  console.log('\n\n✅ ACCOUNTS READY!\n');
  console.log('='*60);

  console.log('\n🔑 AG ACCOUNT:');
  console.log('   Email: ag@ag.go.ke');
  console.log('   Password: ke.12345678.AG');
  console.log('   Role: Attorney General');

  console.log('\n🔑 HOD ACCOUNT:');
  console.log('   Email: hod.test@ag.go.ke');
  console.log('   Password: ke.87654321.AG');
  console.log('   Role: Head of Department');

  console.log('\n\n💡 How to Test:');
  console.log('1. Go to http://localhost:3000');
  console.log('2. Login with either account above');
  console.log('3. AG can view all departments and activities');
  console.log('4. HOD can review activities with Complete/Incomplete + comments');

  process.exit(0);
}

setupAccounts();