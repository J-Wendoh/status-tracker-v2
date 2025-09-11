require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Environment check:', {
  url: supabaseUrl ? '✅' : '❌',
  key: supabaseServiceKey ? '✅' : '❌'
});

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Manual CSV processing
async function setupUsers() {
  console.log('🔄 Processing CSV file manually...');
  
  const fileContent = fs.readFileSync('AG Departmental Tracker - Copy of Sheet1.csv', 'utf8');
  const lines = fileContent.split('\n');
  
  const users = [];
  const departments = new Map();
  const hodEmails = new Map();
  
  // Find the header line
  let headerIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Name of HOD') || lines[i].includes('Phone number')) {
      headerIndex = i;
      break;
    }
  }
  
  if (headerIndex === -1) {
    console.error('❌ Could not find header row');
    return;
  }
  
  console.log(`📋 Found headers at line ${headerIndex + 1}`);
  
  // Process each data line
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Split CSV line handling commas within quotes
    const parts = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        parts.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    parts.push(current.trim()); // Last part
    
    // Map to expected structure
    if (parts.length >= 6) {
      const hodName = parts[1] || '';
      const phone = parts[3] || '';
      const email = parts[4] || '';
      const department = parts[5] || '';
      const county = parts[6] || 'NAIROBI';
      const idNumber = parts[7] || '';
      
      // Skip invalid entries
      if (!email || !department || email.trim() === '' || department.trim() === '') {
        continue;
      }
      
      // Skip header-like entries
      if (email.toLowerCase().includes('email') || department.toLowerCase().includes('department/saga')) {
        continue;
      }
      
      // Clean up department name
      let cleanDepartment = department.trim();
      if (cleanDepartment === 'Department/SAGA') continue;
      
      // Add to departments map
      departments.set(cleanDepartment, {
        name: cleanDepartment,
        type: cleanDepartment.toLowerCase().includes('division') ? 'Division' : 'Department'
      });
      
      // Determine user role
      let category = 'Officer';
      let finalEmail = email.trim();
      let fullName = extractNameFromEmail(finalEmail);
      
      // Check if this is a HOD entry (has name in HOD column and appears first for department)
      if (hodName && hodName.trim() !== '' && 
          !['NJERI WACHIRA', 'JACQUELINE MUINDI', 'JANE JORAM'].includes(hodName.trim()) &&
          !hodEmails.has(cleanDepartment)) {
        
        category = 'HOD';
        fullName = hodName.trim();
        
        // Generate ag.go.ke email for HOD if needed
        if (!finalEmail.includes('@ag.go.ke')) {
          const nameParts = fullName.toLowerCase().split(' ').filter(n => n.length > 0);
          if (nameParts.length >= 2) {
            finalEmail = `${nameParts[0]}.${nameParts[nameParts.length-1]}@ag.go.ke`;
          }
        }
        
        hodEmails.set(cleanDepartment, finalEmail);
      }
      
      // Create user object
      const user = {
        email: finalEmail,
        full_name: fullName,
        phone: phone || '',
        department: cleanDepartment,
        county: county || 'NAIROBI',
        id_number: idNumber || '',
        category: category,
        password: idNumber ? `ke.${idNumber}.AG` : generateDefaultPassword(finalEmail)
      };
      
      users.push(user);
      
      console.log(`📄 Processed: ${finalEmail} (${category}) - ${cleanDepartment}`);
    }
  }
  
  // Remove duplicates based on email
  const uniqueUsers = users.filter((user, index, self) => 
    index === self.findIndex((u) => u.email === user.email)
  );
  
  console.log(`\n📊 Found ${uniqueUsers.length} unique users across ${departments.size} departments`);
  
  // Create departments first
  console.log('\n🏢 Creating departments...');
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
  console.log('\n👥 Creating user accounts...');
  let successCount = 0;
  let errorCount = 0;
  
  for (const user of uniqueUsers) {
    try {
      const departmentId = departmentMap.get(user.department);
      
      if (!departmentId) {
        console.warn(`⚠️  No department ID found for ${user.department}, skipping user ${user.email}`);
        errorCount++;
        continue;
      }

      // Create auth user first
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true
      });

      let userId = authData?.user?.id;
      
      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`⚠️  User ${user.email} already exists in auth`);
          // Get existing user ID
          const { data: existingUsers } = await supabase.auth.admin.listUsers();
          const existingUser = existingUsers.users.find(u => u.email === user.email);
          userId = existingUser?.id;
        } else {
          console.error(`❌ Error creating auth user ${user.email}:`, authError.message);
          errorCount++;
          continue;
        }
      }

      if (!userId) {
        console.error(`❌ No user ID for ${user.email}`);
        errorCount++;
        continue;
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: userId,
          email: user.email,
          full_name: user.full_name,
          county: user.county,
          category: user.category,
          department_saga_id: departmentId
        }, { onConflict: 'id' });

      if (profileError) {
        console.error(`❌ Error creating user profile ${user.email}:`, profileError.message);
        errorCount++;
      } else {
        console.log(`✅ Created user: ${user.email} (${user.category}) - ${user.full_name}`);
        successCount++;
      }

    } catch (err) {
      console.error(`❌ Error processing user ${user.email}:`, err.message);
      errorCount++;
    }
  }
  
  console.log(`\n✨ User setup complete! ✅ ${successCount} success, ❌ ${errorCount} errors`);
  
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
  
  console.log('\n🔑 SAMPLE OFFICER ACCOUNTS:');
  officerUsers.slice(0, 5).forEach(officer => {
    console.log(`  ${officer.email} | ${officer.full_name} | ${officer.department} | Password: ${officer.password}`);
  });
}

function extractNameFromEmail(email) {
  const namepart = email.split('@')[0];
  return namepart.split('.').map(part => 
    part.charAt(0).toUpperCase() + part.slice(1)
  ).join(' ');
}

function generateDefaultPassword(email) {
  const namePart = email.split('@')[0];
  return `ke.${namePart}.AG`;
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

    let userId = authData?.user?.id;

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('⚠️  AG account already exists in auth');
        // Get existing user ID
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingUser = existingUsers.users.find(u => u.email === 'ag@ag.go.ke');
        userId = existingUser?.id;
      } else {
        console.error('❌ Error creating AG auth account:', authError.message);
        return;
      }
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: 'ag@ag.go.ke',
        full_name: 'Hon. Dorcas Oduor SC EBS OGW',
        county: 'NAIROBI',
        category: 'AG',
        department_saga_id: null // AG doesn't belong to a specific department
      }, { onConflict: 'id' });

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