const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  console.log('🧪 Testing Login with ID-based passwords\n');
  console.log('='*60);

  const testAccounts = [
    { email: 'hayangalulu@gmail.com', password: 'ke.11100325.AG', name: 'Lulu Hayanga' },
    { email: 'elizabeth.wamocho@ag.go.ke', password: 'ke.22538413.AG', name: 'Elizabeth Wamocho' },
    { email: 'zahraahmed1992@gmail.com', password: 'ke.29719535.AG', name: 'Zahra Ahmed Hassan' }
  ];

  console.log('Testing authentication for 3 accounts...\n');

  for (const account of testAccounts) {
    console.log(`Testing: ${account.name} (${account.email})`);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: account.email,
      password: account.password
    });

    if (error) {
      console.log(`❌ Login failed: ${error.message}`);
    } else {
      console.log(`✅ Login successful!`);
      console.log(`   User ID: ${data.user.id}`);
      console.log(`   Email verified: ${data.user.email_confirmed_at ? 'Yes' : 'No'}`);

      // Sign out after testing
      await supabase.auth.signOut();
    }
    console.log('');
  }

  console.log('='*60);
  console.log('\n✅ Test Complete!');
  console.log('\nYou can now use these accounts to login at http://localhost:3000');
}

testLogin();