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

const missingUsers = [
  { name: 'Lulu Hayanga', email: 'hayangalulu@gmail.com', department: 'OAG & Dept of Justice' },
  { name: 'Sheila Mammet', email: 'sheila.mammet@ag.go.ke', department: 'International Law Division' },
  { name: 'Zahra Ahmed Hassan', email: 'zahraahmed1992@gmail.com', department: 'Registrar General - Societies' },
  { name: 'Mary Oneya Mukholi', email: 'mukholioneya@gmail.com', department: 'Registrar General - Societies' },
  { name: 'Mary Wairimu Karimi', email: 'wairimumary015@gmail.com', department: 'Registrar General - Societies' },
  { name: 'Seth Masese', email: 'nyamweyaseth@gmail.com', department: 'Legal Advisory and Research Division' },
  { name: 'Lydia Mokaya', email: 'lmokaya@gmail.com', department: 'Legal Advisory and Research Division' },
  { name: 'Jeniffer Nganga', email: 'jenifaciru@gmail.com', department: 'Legal Advisory and Research Division' },
  { name: 'Emmanuel Bitta', email: 'bitta.emmanuel@ag.go.ke', department: 'Legal Advisory and Research Division' },
  { name: 'Charles Mutinda', email: 'charles.mutinda@ag.go.ke', department: 'Civil Litigation' },
  { name: 'Oscar Eredi', email: 'oscar.eredi@ag.go.ke', department: 'Civil Litigation' },
  { name: 'Janet Kungu', email: 'janet.kungu@ag.go.ke', department: 'Civil Litigation' }
];

const departmentMap = {
  'OAG & Dept of Justice': null, // Will need to be created or mapped
  'International Law Division': 21,
  'Registrar General - Societies': 38,
  'Legal Advisory and Research Division': 23,
  'Civil Litigation': 25
};

async function addUsers() {
  console.log('Starting to add missing users...\n');

  for (const user of missingUsers) {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        email_confirm: true,
        password: 'TempPassword123!', // Temporary password - users will need to reset
        user_metadata: {
          full_name: user.name
        }
      });

      if (authError) {
        console.error(`Error creating auth user for ${user.email}:`, authError.message);
        continue;
      }

      console.log(`✅ Created auth user for ${user.name} (${user.email})`);

      // Create profile in public.users table
      const departmentId = departmentMap[user.department];

      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: user.email,
          full_name: user.name,
          county: 'NAIROBI',
          department_saga_id: departmentId,
          category: 'Officer'
        });

      if (profileError) {
        console.error(`Error creating profile for ${user.email}:`, profileError.message);
        // Optionally delete the auth user if profile creation fails
        await supabase.auth.admin.deleteUser(authData.user.id);
      } else {
        console.log(`✅ Created profile for ${user.name}`);
      }

    } catch (error) {
      console.error(`Unexpected error for ${user.email}:`, error);
    }
  }

  console.log('\n✅ Finished adding users');
  process.exit(0);
}

addUsers();