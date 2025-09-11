require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🌐 Browser Login Simulation Test');
console.log('================================\n');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function simulateLoginFlow() {
  const testAccount = {
    email: 'ag@ag.go.ke',
    password: 'ke.AG001.AG'
  };

  console.log('🔧 Environment Check:');
  console.log('• URL:', supabaseUrl);
  console.log('• Anon Key:', supabaseAnonKey ? 'Present' : 'Missing');
  console.log();

  try {
    // Step 1: Clear any existing session
    console.log('1️⃣  Clearing any existing session...');
    await supabase.auth.signOut();
    console.log('   ✅ Session cleared');

    // Step 2: Attempt login exactly like the form does
    console.log('\n2️⃣  Attempting login with form data...');
    console.log(`   Email: ${testAccount.email}`);
    console.log(`   Password: ${testAccount.password}`);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testAccount.email,
      password: testAccount.password,
    });

    if (error) {
      console.error('   ❌ Login failed with error:', error);
      console.error('      • Message:', error.message);
      console.error('      • Status:', error.status);
      console.error('      • Code:', error.__isAuthError ? 'AuthError' : 'Unknown');
      return;
    }

    console.log('   ✅ Login successful!');
    console.log('   • User ID:', data.user.id);
    console.log('   • Email confirmed:', data.user.email_confirmed_at ? 'Yes' : 'No');
    console.log('   • Session expires:', new Date(data.session.expires_at * 1000).toLocaleString());

    // Step 3: Test what the dashboard would see
    console.log('\n3️⃣  Testing dashboard authentication...');
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      console.error('   ❌ Dashboard would not see authenticated user');
      return;
    }

    console.log('   ✅ Dashboard would see authenticated user');
    
    // Step 4: Test profile fetch (like dashboard does)
    console.log('\n4️⃣  Testing profile fetch...');
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('category, full_name')
      .eq('id', userData.user.id)
      .single();

    if (profileError || !profile) {
      console.error('   ❌ Profile fetch failed:', profileError?.message);
      return;
    }

    console.log('   ✅ Profile fetched successfully');
    console.log('   • Name:', profile.full_name);
    console.log('   • Role:', profile.category);

    // Step 5: Determine redirect
    console.log('\n5️⃣  Determining redirect destination...');
    let redirectPath;
    switch (profile.category) {
      case 'Officer':
        redirectPath = '/dashboard/officer';
        break;
      case 'HOD':
      case 'CEO':
        redirectPath = '/dashboard/hod';
        break;
      case 'AG':
        redirectPath = '/dashboard/ag';
        break;
      default:
        redirectPath = '/auth/login';
    }

    console.log(`   ✅ Should redirect to: ${redirectPath}`);

    console.log('\n🎉 Complete login flow simulation successful!');
    console.log('   The authentication system is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message);
    console.error('Stack:', error.stack);
  }
}

simulateLoginFlow().catch(console.error);