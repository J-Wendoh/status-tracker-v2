require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
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

async function setupSystem() {
  console.log('🚀 Starting complete OAG system setup...\n');
  
  // 1. Create Attorney General account
  await createAGAccount();
  
  // 2. Parse CSV and create departments
  const { users, departments } = await parseCSV();
  
  // 3. Create departments
  const departmentMap = await createDepartments(departments);
  
  // 4. Create users
  await createUsers(users, departmentMap);
  
  // 5. Create services for departments
  await createServices(departmentMap);
  
  console.log('\n🎉 Complete setup finished successfully!');
}

async function createAGAccount() {
  console.log('👑 Creating Attorney General account...');
  
  try {
    // Check if AG account already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingAG = existingUsers.users.find(u => u.email === 'ag@ag.go.ke');
    
    let userId;
    
    if (existingAG) {
      console.log('⚠️  AG account already exists in auth');
      userId = existingAG.id;
    } else {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: 'ag@ag.go.ke',
        password: 'ke.AG001.AG',
        email_confirm: true
      });
      
      if (authError) {
        console.error('❌ Error creating AG auth account:', authError.message);
        return;
      }
      
      userId = authData.user.id;
    }

    // Create/update user profile
    const { error: profileError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: 'ag@ag.go.ke',
        full_name: 'Hon. Dorcas Oduor SC EBS OGW',
        county: 'NAIROBI',
        category: 'AG',
        department_saga_id: null
      }, { onConflict: 'id' });

    if (profileError) {
      console.error('❌ Error creating AG profile:', profileError.message);
    } else {
      console.log('✅ Created/updated Attorney General account: ag@ag.go.ke | Password: ke.AG001.AG');
    }

  } catch (err) {
    console.error('❌ Error with AG account:', err.message);
  }
}

async function parseCSV() {
  console.log('📋 Processing CSV file...');
  
  const fileContent = fs.readFileSync('AG Departmental Tracker - Copy of Sheet1.csv', 'utf8');
  const lines = fileContent.split('\n');
  
  const users = [];
  const departments = new Set();
  const hodEmails = new Map();
  
  // Find the header line
  let headerIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Name of HOD') || lines[i].includes('Phone number')) {
      headerIndex = i;
      break;
    }
  }
  
  console.log(`📋 Found headers at line ${headerIndex + 1}`);
  
  // Process each data line
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Simple CSV split (handles most cases)
    const parts = line.split('","').map(p => p.replace(/^"/, '').replace(/"$/, ''));
    
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
      
      // Fix some department name issues
      if (cleanDepartment === 'e') cleanDepartment = 'Advocates Complaints Commission';
      
      departments.add(cleanDepartment);
      
      // Determine user role
      let category = 'Officer';
      let finalEmail = email.trim();
      let fullName = extractNameFromEmail(finalEmail);
      
      // Check if this is a HOD entry
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
      
      users.push({
        email: finalEmail,
        full_name: fullName,
        phone: phone || '',
        department: cleanDepartment,
        county: county || 'NAIROBI',
        id_number: idNumber || '',
        category: category,
        password: idNumber ? `ke.${idNumber}.AG` : generateDefaultPassword(finalEmail)
      });
    }
  }
  
  // Remove duplicates
  const uniqueUsers = users.filter((user, index, self) => 
    index === self.findIndex((u) => u.email === user.email)
  );
  
  console.log(`📊 Found ${uniqueUsers.length} unique users across ${departments.size} departments`);
  
  return { users: uniqueUsers, departments };
}

async function createDepartments(departments) {
  console.log('\n🏢 Creating departments...');
  const departmentMap = new Map();
  
  for (const deptName of departments) {
    try {
      // Try to get existing department first
      const { data: existing } = await supabase
        .from('departments_sagas')
        .select('id, name')
        .eq('name', deptName)
        .single();
      
      if (existing) {
        departmentMap.set(deptName, existing.id);
        console.log(`✅ Found existing department: ${deptName}`);
      } else {
        // Create new department
        const { data, error } = await supabase
          .from('departments_sagas')
          .insert({
            name: deptName,
            type: deptName.toLowerCase().includes('division') ? 'Division' : 'Department'
          })
          .select('id, name')
          .single();

        if (error) {
          console.error(`❌ Error creating department ${deptName}:`, error.message);
        } else {
          departmentMap.set(deptName, data.id);
          console.log(`✅ Created department: ${deptName}`);
        }
      }
    } catch (err) {
      console.error(`❌ Error with department ${deptName}:`, err.message);
    }
  }
  
  return departmentMap;
}

async function createUsers(users, departmentMap) {
  console.log('\n👥 Creating user accounts...');
  let successCount = 0;
  let errorCount = 0;
  
  // Get existing auth users to avoid conflicts
  const { data: existingAuthUsers } = await supabase.auth.admin.listUsers();
  const existingEmails = new Set(existingAuthUsers.users.map(u => u.email));
  
  for (const user of users) {
    try {
      const departmentId = departmentMap.get(user.department);
      
      if (!departmentId) {
        console.warn(`⚠️  No department ID found for ${user.department}, skipping user ${user.email}`);
        errorCount++;
        continue;
      }

      let userId;
      
      if (existingEmails.has(user.email)) {
        // Get existing user ID
        const existingUser = existingAuthUsers.users.find(u => u.email === user.email);
        userId = existingUser.id;
        console.log(`⚠️  Auth user ${user.email} already exists`);
      } else {
        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true
        });

        if (authError) {
          console.error(`❌ Error creating auth user ${user.email}:`, authError.message);
          errorCount++;
          continue;
        }
        
        userId = authData.user.id;
      }

      // Create/update user profile
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
        console.log(`✅ Created/updated: ${user.email} (${user.category}) - ${user.full_name}`);
        successCount++;
      }

    } catch (err) {
      console.error(`❌ Error processing user ${user.email}:`, err.message);
      errorCount++;
    }
  }
  
  console.log(`\n✨ User setup complete! ✅ ${successCount} success, ❌ ${errorCount} errors`);
  
  // Print summary
  const hodUsers = users.filter(u => u.category === 'HOD');
  const officerUsers = users.filter(u => u.category === 'Officer');
  
  console.log('\n📋 SUMMARY:');
  console.log(`👑 HODs: ${hodUsers.length}`);
  console.log(`👤 Officers: ${officerUsers.length}`);
  
  console.log('\n🔑 HOD ACCOUNTS:');
  hodUsers.forEach(hod => {
    console.log(`  ${hod.email} | ${hod.full_name} | ${hod.department} | Password: ${hod.password}`);
  });
}

async function createServices(departmentMap) {
  console.log('\n🔧 Creating services for departments...');
  
  const serviceTemplates = {
    'INTERNATIONAL LAW DIVISION': [
      'International Agreements Negotiated',
      'Treaties Drafted and Vetted', 
      'Legal Opinions on International Law',
      'Government Position Papers Prepared',
      'International Court Representations'
    ],
    'Government Transactions Division': [
      'Procurement Contracts Vetted',
      'Commercial Agreements Reviewed',
      'Financing Agreements Processed',
      'Cabinet Memoranda Reviewed',
      'Memorandums of Understanding Drafted'
    ],
    'Legal Advisory & Research Department': [
      'Cabinet Memoranda Reviewed',
      'Legal Advisories and Opinions',
      'Memorandum of Understandings',
      'Legal Research Reports',
      'Policy Documents Reviewed'
    ],
    'REGISTRAR GENERAL-SOCIETIES': [
      'Society Registrations Processed',
      'Society Name Reservations',
      'Annual Returns Reviewed',
      'Compliance Certificates Issued',
      'Society Amendments Processed'
    ],
    'REGISTRAR GENERAL - SOCIETIES': [
      'Society Registrations Processed',
      'Society Name Reservations',
      'Annual Returns Reviewed',
      'Compliance Certificates Issued',
      'Society Amendments Processed'
    ],
    'REGISTRAR GENERAL-COLLEGE OF ARMS AND ADOPTION': [
      'Coat of Arms Applications',
      'Heraldic Designs Approved',
      'Adoption Orders Processed',
      'Certificate of Arms Issued',
      'Genealogical Research Conducted'
    ],
    'Advocates Complaints Commission': [
      'Complaint Cases Reviewed',
      'Disciplinary Hearings Conducted',
      'Investigation Reports Prepared',
      'Professional Conduct Reviews',
      'Sanctions Imposed'
    ],
    'Public Trustee Department': [
      'Estate Administration Cases',
      'Trust Fund Management',
      'Guardianship Applications',
      'Property Valuations Conducted',
      'Beneficiary Distributions'
    ]
  };
  
  for (const [deptName, deptId] of departmentMap) {
    const services = serviceTemplates[deptName] || [
      'Activities Completed',
      'Reports Generated',
      'Consultations Conducted'
    ];
    
    console.log(`🏢 Creating services for: ${deptName}`);
    
    for (const serviceName of services) {
      try {
        // Check if service already exists
        const { data: existing } = await supabase
          .from('services')
          .select('id')
          .eq('name', serviceName)
          .eq('department_saga_id', deptId)
          .single();
        
        if (existing) {
          console.log(`  ✅ Service already exists: ${serviceName}`);
        } else {
          const { error } = await supabase
            .from('services')
            .insert({
              name: serviceName,
              department_saga_id: deptId
            });
          
          if (error) {
            console.error(`  ❌ Error creating service ${serviceName}:`, error.message);
          } else {
            console.log(`  ✅ Created service: ${serviceName}`);
          }
        }
      } catch (err) {
        console.error(`  ❌ Error with service ${serviceName}:`, err.message);
      }
    }
  }
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

// Run the setup
setupSystem().catch(console.error);