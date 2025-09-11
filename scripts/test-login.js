require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing login with AG credentials...');
console.log('URL:', supabaseUrl ? '✅' : '❌');
console.log('Key:', supabaseAnonKey ? '✅' : '❌');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  const accounts = [
    { email: 'ag@ag.go.ke', password: 'ke.AG001.AG' },
    { email: 'hod.test@ag.go.ke', password: 'ke.HOD001.AG' },
    { email: 'officer.test@ag.go.ke', password: 'ke.OFF001.AG' }
  ];

  for (const account of accounts) {
    console.log(`\n🧪 Testing: ${account.email}`);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword(account);

      if (error) {
        console.error('❌ Login failed:', error.message);
      } else {
        console.log('✅ Login successful!');
        console.log('User ID:', data.user.id);
        console.log('Email:', data.user.email);
        
        // Test getting user profile
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (profileError) {
          console.error('❌ Profile fetch failed:', profileError.message);
        } else {
          console.log('✅ Profile found:');
          console.log('Name:', profile.full_name);
          console.log('Category:', profile.category);
        }
      }
    } catch (err) {
      console.error('❌ Unexpected error:', err.message);
    }
  }
}

testLogin();