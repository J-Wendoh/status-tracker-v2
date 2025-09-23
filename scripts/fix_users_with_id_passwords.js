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

// Users with ID numbers who should have accounts
const usersWithIds = [
  { name: 'Lulu Hayanga', email: 'hayangalulu@gmail.com', id: '11100325', department: 'OAG & Dept of Justice' },
  { name: 'Elizabeth Wamocho', email: 'elizabeth.wamocho@ag.go.ke', id: '22538413', department: 'International Law Division' },
  { name: 'Zahra Ahmed Hassan', email: 'zahraahmed1992@gmail.com', id: '29719535', department: 'Registrar General - Societies' },
  { name: 'Mary Oneya Mukholi', email: 'mukholioneya@gmail.com', id: '7113025', department: 'Registrar General - Societies' },
  { name: 'Mary Wairimu Karimi', email: 'wairimumary015@gmail.com', id: '8813964', department: 'Registrar General - Societies' }
];

// Users without IDs who should be deleted
const usersToDelete = [
  'sheila.mammet@ag.go.ke',
  'nyamweyaseth@gmail.com',
  'lmokaya@gmail.com',
  'jenifaciru@gmail.com',
  'bitta.emmanuel@ag.go.ke',
  'charles.mutinda@ag.go.ke',
  'oscar.eredi@ag.go.ke',
  'janet.kungu@ag.go.ke'
];

const departmentMap = {
  'OAG & Dept of Justice': null,
  'International Law Division': 21,
  'Registrar General - Societies': 38
};

async function fixUsers() {
  console.log('🔧 Fixing User Accounts\n');
  console.log('='*60);

  // Step 1: Delete users without ID numbers
  console.log('\n📝 Removing users without ID numbers...\n');

  for (const email of usersToDelete) {
    try {
      // First get the user ID
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (userData) {
        // Delete from public.users first (due to foreign key constraints)
        await supabase
          .from('users')
          .delete()
          .eq('email', email);

        // Then delete from auth.users
        const { error } = await supabase.auth.admin.deleteUser(userData.id);

        if (!error) {
          console.log(`✅ Deleted user: ${email}`);
        } else {
          console.log(`⚠️ Could not delete auth user: ${email} - ${error.message}`);
        }
      } else {
        console.log(`ℹ️ User not found: ${email}`);
      }
    } catch (error) {
      console.log(`❌ Error deleting ${email}:`, error.message);
    }
  }

  // Step 2: Update or create users with IDs
  console.log('\n\n📝 Updating/Creating users with ID-based passwords...\n');

  for (const user of usersWithIds) {
    try {
      const password = `ke.${user.id}.AG`;

      // Check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single();

      if (existingUser) {
        // Update existing user's password
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          existingUser.id,
          { password: password }
        );

        if (!updateError) {
          console.log(`✅ Updated password for ${user.name} (${user.email})`);
          console.log(`   New password: ${password}`);
        } else {
          console.log(`❌ Error updating password for ${user.email}:`, updateError.message);
        }
      } else {
        // Create new user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: password,
          email_confirm: true,
          user_metadata: {
            full_name: user.name
          }
        });

        if (!authError && authData.user) {
          // Create profile in public.users table
          const { error: profileError } = await supabase
            .from('users')
            .insert({
              id: authData.user.id,
              email: user.email,
              full_name: user.name,
              county: 'NAIROBI',
              department_saga_id: departmentMap[user.department],
              category: 'Officer'
            });

          if (!profileError) {
            console.log(`✅ Created user: ${user.name} (${user.email})`);
            console.log(`   Password: ${password}`);
          } else {
            console.log(`❌ Error creating profile for ${user.email}:`, profileError.message);
            // Clean up auth user if profile creation failed
            await supabase.auth.admin.deleteUser(authData.user.id);
          }
        } else {
          console.log(`❌ Error creating auth user for ${user.email}:`, authError?.message);
        }
      }
    } catch (error) {
      console.error(`❌ Unexpected error for ${user.email}:`, error);
    }
  }

  console.log('\n\n✅ User management complete!');

  console.log('\n📋 THREE TEST ACCOUNTS READY:');
  console.log('='*60);

  const testAccounts = usersWithIds.slice(0, 3);
  testAccounts.forEach((user, index) => {
    console.log(`\n🔑 Account ${index + 1}:`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: ke.${user.id}.AG`);
  });

  console.log('\n\n💡 Testing Instructions:');
  console.log('1. Go to http://localhost:3000');
  console.log('2. Click on "Login"');
  console.log('3. Use any of the above credentials');
  console.log('4. The password format is: ke.[ID_NUMBER].AG');

  process.exit(0);
}

fixUsers();