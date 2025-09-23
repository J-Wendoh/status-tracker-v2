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

async function verifyUsers() {
  console.log('🔍 Verifying Users from AG Department Excel\n');
  console.log('='*60);

  const emailsToCheck = [
    'hayangalulu@gmail.com',
    'sheila.mammet@ag.go.ke',
    'bitta.emmanuel@ag.go.ke',
    'charles.mutinda@ag.go.ke',
    'oscar.eredi@ag.go.ke',
    'janet.kungu@ag.go.ke'
  ];

  console.log('Checking users in database...\n');

  for (const email of emailsToCheck) {
    const { data: user, error } = await supabase
      .from('users')
      .select('*, departments_sagas!inner(name)')
      .eq('email', email)
      .single();

    if (error) {
      console.log(`❌ ${email} - NOT FOUND`);
    } else {
      console.log(`✅ ${email}`);
      console.log(`   Name: ${user.full_name}`);
      console.log(`   Department: ${user.departments_sagas?.name || 'Not assigned'}`);
      console.log(`   Category: ${user.category}`);
      console.log('');
    }
  }

  // Get total counts
  const { data: allUsers } = await supabase
    .from('users')
    .select('id', { count: 'exact' });

  const { data: officerUsers } = await supabase
    .from('users')
    .select('id', { count: 'exact' })
    .eq('category', 'Officer');

  console.log('\n📊 Database Statistics:');
  console.log(`Total users: ${allUsers?.length || 0}`);
  console.log(`Officers: ${officerUsers?.length || 0}`);

  console.log('\n💡 Test Instructions:');
  console.log('1. These users can now log in with temporary password: TempPassword123!');
  console.log('2. They will need to reset their passwords on first login');
  console.log('3. Open http://localhost:3000 to access the application');
  console.log('4. HODs can review activities by clicking "Update Status"');
  console.log('5. Officers can submit activities through their dashboard');
}

verifyUsers();