require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testing Complete Authentication Flow\n');
console.log('=======================================\n');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuthFlow() {
  const testAccounts = [
    { 
      email: 'ag@ag.go.ke', 
      password: 'ke.AG001.AG',
      expectedRole: 'AG',
      expectedDashboard: '/dashboard/ag'
    },
    { 
      email: 'hod.test@ag.go.ke', 
      password: 'ke.HOD001.AG',
      expectedRole: 'HOD',
      expectedDashboard: '/dashboard/hod'
    },
    { 
      email: 'officer.test@ag.go.ke', 
      password: 'ke.OFF001.AG',
      expectedRole: 'Officer',
      expectedDashboard: '/dashboard/officer'
    }
  ];

  for (const account of testAccounts) {
    console.log(`\n📧 Testing: ${account.email}`);
    console.log('─'.repeat(40));
    
    try {
      // Test 1: Sign In
      console.log('1️⃣  Attempting sign in...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password
      });

      if (signInError) {
        console.error('   ❌ Sign in failed:', signInError.message);
        continue;
      }
      
      console.log('   ✅ Sign in successful');
      console.log('   • User ID:', signInData.user.id);
      console.log('   • Session:', signInData.session ? 'Created' : 'Missing');
      
      // Test 2: Get Session
      console.log('\n2️⃣  Checking session...');
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('   ❌ Session check failed:', sessionError.message);
      } else if (!sessionData.session) {
        console.error('   ❌ No active session found');
      } else {
        console.log('   ✅ Session is active');
        console.log('   • Access token:', sessionData.session.access_token ? 'Present' : 'Missing');
        console.log('   • Expires at:', new Date(sessionData.session.expires_at * 1000).toLocaleString());
      }
      
      // Test 3: Get User Profile
      console.log('\n3️⃣  Fetching user profile...');
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', signInData.user.id)
        .single();
      
      if (profileError) {
        console.error('   ❌ Profile fetch failed:', profileError.message);
      } else {
        console.log('   ✅ Profile retrieved');
        console.log('   • Name:', profile.full_name);
        console.log('   • Role:', profile.category);
        console.log('   • County:', profile.county);
        
        if (profile.category !== account.expectedRole) {
          console.warn(`   ⚠️  Role mismatch! Expected: ${account.expectedRole}, Got: ${profile.category}`);
        } else {
          console.log(`   ✅ Role matches expected: ${account.expectedRole}`);
        }
      }
      
      // Test 4: Check Department (for HOD/Officer)
      if (account.expectedRole !== 'AG' && profile) {
        console.log('\n4️⃣  Checking department assignment...');
        if (!profile.department_saga_id) {
          console.warn('   ⚠️  No department assigned');
        } else {
          const { data: dept, error: deptError } = await supabase
            .from('departments_sagas')
            .select('*')
            .eq('id', profile.department_saga_id)
            .single();
          
          if (deptError) {
            console.error('   ❌ Department fetch failed:', deptError.message);
          } else {
            console.log('   ✅ Department found:', dept.name);
          }
        }
      }
      
      // Test 5: Sign Out
      console.log('\n5️⃣  Testing sign out...');
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) {
        console.error('   ❌ Sign out failed:', signOutError.message);
      } else {
        console.log('   ✅ Sign out successful');
        
        // Verify session is cleared
        const { data: checkSession } = await supabase.auth.getSession();
        if (!checkSession.session) {
          console.log('   ✅ Session cleared successfully');
        } else {
          console.warn('   ⚠️  Session still exists after sign out');
        }
      }
      
      console.log('\n' + '═'.repeat(40));
      console.log(`✅ ${account.email} - All tests completed`);
      console.log(`   Expected dashboard: ${account.expectedDashboard}`);
      
    } catch (err) {
      console.error(`\n❌ Unexpected error for ${account.email}:`, err.message);
    }
  }
  
  console.log('\n\n📊 AUTHENTICATION FLOW TEST SUMMARY');
  console.log('═'.repeat(40));
  console.log('✅ All authentication tests completed');
  console.log('\n🔐 Available Login Credentials:');
  testAccounts.forEach(acc => {
    console.log(`   ${acc.expectedRole.padEnd(10)} ${acc.email.padEnd(25)} | ${acc.password}`);
  });
}

testAuthFlow().catch(console.error);