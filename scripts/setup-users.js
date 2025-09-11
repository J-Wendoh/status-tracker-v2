require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service role key for admin operations

console.log('Environment check:', {
  url: supabaseUrl ? '✅' : '❌',
  key: supabaseServiceKey ? '✅' : '❌'
});

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Parse CSV and create user accounts
async function setupUsers() {
  const users = [];
  const departments = new Map();
  const hodEmails = new Map();

  console.log('🔄 Processing CSV file...');

  // First pass: collect all users and identify departments
  await new Promise((resolve, reject) => {
    fs.createReadStream('AG Departmental Tracker - Copy of Sheet1.csv')
      .pipe(csv())
      .on('data', (row) => {
        // Skip empty rows or invalid data
        if (!row.Email || !row['Department/SAGA'] || row.Email.trim() === '') {
          return;
        }

        const email = row.Email.trim();
        const fullName = (row['Name of HOD/ \nDirector of SAGA'] || '').trim();
        const phone = (row['Phone number'] || '').trim();
        const department = (row['Department/SAGA'] || '').trim();
        const county = (row['Location(County)'] || 'NAIROBI').trim();
        const idNumber = (row['ID Number'] || '').trim();

        // Skip if essential data is missing
        if (!email || !department) return;

        // Collect departments
        if (department !== 'Department/SAGA') {
          departments.set(department, {
            name: department,
            type: department.includes('DIVISION') ? 'Division' : 'Department'
          });
        }

        // Determine user role and create user object
        let category = 'Officer';
        let finalEmail = email;

        // If this person is listed as HOD (has a name in the HOD column)
        if (fullName && fullName !== 'NJERI WACHIRA' && fullName !== 'JACQUELINE MUINDI' && fullName !== 'JANE JORAM') {
          category = 'HOD';
          // Create ag.go.ke email for HOD if not already one
          if (!email.includes('@ag.go.ke')) {
            const nameParts = fullName.toLowerCase().split(' ');
            if (nameParts.length >= 2) {
              finalEmail = `${nameParts[0]}.${nameParts[1]}@ag.go.ke`;
            }
          }
          hodEmails.set(department, finalEmail);
        }

        // Create user object
        const user = {
          email: finalEmail,
          full_name: fullName || extractNameFromEmail(email),
          phone: phone || '',
          department: department,
          county: county,
          id_number: idNumber || '',
          category: category,
          password: idNumber ? `ke.${idNumber}.AG` : 'ke.default.AG'
        };

        users.push(user);
      })
      .on('end', resolve)
      .on('error', reject);
  });

  // Remove duplicates based on email
  const uniqueUsers = users.filter((user, index, self) => 
    index === self.findIndex((u) => u.email === user.email)
  );

  console.log(`📊 Found ${uniqueUsers.length} unique users`);
  console.log(`📊 Found ${departments.size} departments`);

  // Create departments first
  console.log('🏢 Creating departments...');
  for (const [deptName, deptInfo] of departments) {
    try {
      const { data, error } = await supabase
        .from('departments_sagas')
        .upsert({
          name: deptName,
          type: deptInfo.type
        }, { onConflict: 'name' });

      if (error) {
        console.error(`❌ Error creating department ${deptName}:`, error.message);
      } else {
        console.log(`✅ Created/updated department: ${deptName}`);
      }
    } catch (err) {
      console.error(`❌ Error creating department ${deptName}:`, err.message);
    }
  }

  // Get all departments with their IDs
  const { data: allDepartments } = await supabase
    .from('departments_sagas')
    .select('id, name');

  const departmentMap = new Map();
  allDepartments?.forEach(dept => {
    departmentMap.set(dept.name, dept.id);
  });

  // Create users
  console.log('👥 Creating user accounts...');
  for (const user of uniqueUsers) {
    try {
      const departmentId = departmentMap.get(user.department);
      
      if (!departmentId) {
        console.warn(`⚠️  No department ID found for ${user.department}, skipping user ${user.email}`);
        continue;
      }

      // Create auth user first
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true
      });

      if (authError && !authError.message.includes('already registered')) {
        console.error(`❌ Error creating auth user ${user.email}:`, authError.message);
        continue;
      }

      const userId = authData?.user?.id;

      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: userId || authError?.message?.includes('already registered') ? 
            (await supabase.auth.admin.listUsers()).data.users.find(u => u.email === user.email)?.id : 
            userId,
          email: user.email,
          full_name: user.full_name,
          county: user.county,
          category: user.category,
          department_saga_id: departmentId
        }, { onConflict: 'email' });

      if (profileError) {
        console.error(`❌ Error creating user profile ${user.email}:`, profileError.message);
      } else {
        console.log(`✅ Created user: ${user.email} (${user.category}) - ${user.full_name}`);
      }

    } catch (err) {
      console.error(`❌ Error processing user ${user.email}:`, err.message);
    }
  }

  console.log('✨ User setup complete!');
  
  // Print summary
  const hodUsers = uniqueUsers.filter(u => u.category === 'HOD');
  const officerUsers = uniqueUsers.filter(u => u.category === 'Officer');
  
  console.log('\n📋 SUMMARY:');
  console.log(`👑 HODs: ${hodUsers.length}`);
  console.log(`👤 Officers: ${officerUsers.length}`);
  console.log(`🏢 Departments: ${departments.size}`);
  
  console.log('\n🔑 HOD ACCOUNTS:');
  hodUsers.forEach(hod => {
    console.log(`  ${hod.email} | ${hod.full_name} | ${hod.department} | Password: ${hod.password}`);
  });
}

function extractNameFromEmail(email) {
  const namepart = email.split('@')[0];
  return namepart.split('.').map(part => 
    part.charAt(0).toUpperCase() + part.slice(1)
  ).join(' ');
}

// Add Attorney General account
async function createAGAccount() {
  console.log('👑 Creating Attorney General account...');
  
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'ag@ag.go.ke',
      password: 'ke.AG001.AG',
      email_confirm: true
    });

    if (authError && !authError.message.includes('already registered')) {
      console.error('❌ Error creating AG auth account:', authError.message);
      return;
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .upsert({
        id: authData?.user?.id,
        email: 'ag@ag.go.ke',
        full_name: 'Hon. Dorcas Oduor SC EBS OGW',
        county: 'NAIROBI',
        category: 'AG',
        department_saga_id: null // AG doesn't belong to a specific department
      }, { onConflict: 'email' });

    if (profileError) {
      console.error('❌ Error creating AG profile:', profileError.message);
    } else {
      console.log('✅ Created Attorney General account: ag@ag.go.ke | Password: ke.AG001.AG');
    }

  } catch (err) {
    console.error('❌ Error creating AG account:', err.message);
  }
}

// Run the setup
async function main() {
  console.log('🚀 Starting user account setup...\n');
  
  await createAGAccount();
  await setupUsers();
  
  console.log('\n🎉 Setup completed successfully!');
}

main().catch(console.error);