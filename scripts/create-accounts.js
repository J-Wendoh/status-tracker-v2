require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  console.log('🚀 Creating OAG user accounts...\n');
  
  // Manually defined user data based on the CSV
  const departments = [
    'International Law Division',
    'Government Transactions Division', 
    'Legal Advisory and Research Division',
    'Registrar General - Societies',
    'Registrar General - College of Arms and Adoption',
    'Advocates Complaints Commission',
    'Public Trustee Department'
  ];
  
  const users = [
    // HODs first
    { email: 'njeri.wachira@ag.go.ke', name: 'Njeri Wachira', dept: 'International Law Division', category: 'HOD', id: '26702732' },
    { email: 'jacqueline.muindi@ag.go.ke', name: 'Jacqueline Muindi', dept: 'Government Transactions Division', category: 'HOD', id: '78901234' },
    { email: 'pauline.mcharo@ag.go.ke', name: 'Pauline Mcharo', dept: 'Legal Advisory and Research Division', category: 'HOD', id: '56789012' },
    { email: 'jane.joram@ag.go.ke', name: 'Jane Joram', dept: 'Registrar General - Societies', category: 'HOD', id: '9256650' },
    { email: 'george.nyakundi@ag.go.ke', name: 'George Nyakundi', dept: 'Advocates Complaints Commission', category: 'HOD', id: '21907911' },
    { email: 'lucy.mugo@ag.go.ke', name: 'Lucy Mugo', dept: 'Public Trustee Department', category: 'HOD', id: '10863989' },
    
    // Officers
    { email: 'nelly.lodian@ag.go.ke', name: 'Nelly Lodian', dept: 'International Law Division', category: 'Officer', id: '26768906' },
    { email: 'afandi.olando@ag.go.ke', name: 'Afandi Olando', dept: 'International Law Division', category: 'Officer', id: '25068291' },
    { email: 'rachel.mbugua@ag.go.ke', name: 'Rachel Mbugua', dept: 'International Law Division', category: 'Officer', id: '22386004' },
    { email: 'leah.aywah@ag.go.ke', name: 'Leah Aywah', dept: 'International Law Division', category: 'Officer', id: '11094312' },
    { email: 'allan.githaiga@ag.go.ke', name: 'Allan Githaiga', dept: 'International Law Division', category: 'Officer', id: '22215596' },
    { email: 'charles.wamwayi@ag.go.ke', name: 'Charles Wamwayi', dept: 'International Law Division', category: 'Officer', id: '25093833' },
    { email: 'elizabeth.wamocho@ag.go.ke', name: 'Elizabeth Wamocho', dept: 'International Law Division', category: 'Officer', id: '27947786' },
    { email: 'anne.mulama@ag.go.ke', name: 'Anne Mulama', dept: 'International Law Division', category: 'Officer', id: '27744766' },
    { email: 'purity.cheptoo@ag.go.ke', name: 'Purity Cheptoo', dept: 'International Law Division', category: 'Officer', id: '28243058' },
    { email: 'edwin.mwangi@ag.go.ke', name: 'Edwin Mwangi', dept: 'International Law Division', category: 'Officer', id: '25207563' },
    
    { email: 'sharon.irungu@ag.go.ke', name: 'Sharon Irungu', dept: 'Government Transactions Division', category: 'Officer', id: '12345678' },
    { email: 'peter.ongori@ag.go.ke', name: 'Peter Ongori', dept: 'Government Transactions Division', category: 'Officer', id: '23456789' },
    { email: 'nevis.ombasa@ag.go.ke', name: 'Nevis Ombasa', dept: 'Government Transactions Division', category: 'Officer', id: '34567890' },
    { email: 'ashley.toywa@ag.go.ke', name: 'Ashley Toywa', dept: 'Government Transactions Division', category: 'Officer', id: '45678901' },
    { email: 'barbara.nguyu@ag.go.ke', name: 'Barbara Nguyu', dept: 'Government Transactions Division', category: 'Officer', id: '56789013' },
    { email: 'caren.okiru@ag.go.ke', name: 'Caren Okiru', dept: 'Government Transactions Division', category: 'Officer', id: '67890123' },
    { email: 'cynthia.koech@ag.go.ke', name: 'Cynthia Koech', dept: 'Government Transactions Division', category: 'Officer', id: '30124335' },
    
    { email: 'pauline.moranga@ag.go.ke', name: 'Pauline Moranga', dept: 'Legal Advisory and Research Division', category: 'Officer', id: '78901235' },
    { email: 'james.murache@ag.go.ke', name: 'James Murache', dept: 'Legal Advisory and Research Division', category: 'Officer', id: '89012346' },
    
    { email: 'sarah.omondi@ag.go.ke', name: 'Sarah Omondi', dept: 'Advocates Complaints Commission', category: 'Officer', id: '21907911' },
    { email: 'lydia.ochako@ag.go.ke', name: 'Lydia Ochako', dept: 'Advocates Complaints Commission', category: 'Officer', id: '23694604' },
    { email: 'alice.mwendwa@ag.go.ke', name: 'Alice Mwendwa', dept: 'Advocates Complaints Commission', category: 'Officer', id: '24115813' },
    
    { email: 'dorcas.nyalwidhe@ag.go.ke', name: 'Dorcas Nyalwidhe', dept: 'Public Trustee Department', category: 'Officer', id: '10863989' }
  ];

  // 1. Create departments
  console.log('🏢 Creating departments...');
  const departmentMap = new Map();
  
  for (const deptName of departments) {
    try {
      const { data: existing } = await supabase
        .from('departments_sagas')
        .select('id, name')
        .eq('name', deptName)
        .single();
      
      if (existing) {
        departmentMap.set(deptName, existing.id);
        console.log(`✅ Department exists: ${deptName}`);
      } else {
        const { data, error } = await supabase
          .from('departments_sagas')
          .insert({
            name: deptName,
            type: deptName.includes('Division') ? 'Division' : 'Department'
          })
          .select('id')
          .single();

        if (error) {
          console.error(`❌ Error creating ${deptName}:`, error.message);
        } else {
          departmentMap.set(deptName, data.id);
          console.log(`✅ Created: ${deptName}`);
        }
      }
    } catch (err) {
      console.error(`❌ Error with ${deptName}:`, err.message);
    }
  }

  // 2. Create Attorney General
  console.log('\n👑 Creating Attorney General...');
  await createUser({
    email: 'ag@ag.go.ke',
    name: 'Hon. Dorcas Oduor SC EBS OGW', 
    category: 'AG',
    password: 'ke.AG001.AG',
    departmentId: null
  });

  // 3. Create all users
  console.log('\n👥 Creating users...');
  let successCount = 0;
  let errorCount = 0;

  for (const user of users) {
    const departmentId = departmentMap.get(user.dept);
    if (!departmentId) {
      console.error(`❌ No department ID for ${user.dept}`);
      errorCount++;
      continue;
    }

    const success = await createUser({
      email: user.email,
      name: user.name,
      category: user.category,
      password: `ke.${user.id}.AG`,
      departmentId: departmentId
    });

    if (success) successCount++;
    else errorCount++;
  }

  // 4. Create services
  console.log('\n🔧 Creating services...');
  const services = {
    'International Law Division': [
      'International Agreements Negotiated',
      'Treaties Drafted and Vetted',
      'Legal Opinions on International Law',
      'Government Position Papers'
    ],
    'Government Transactions Division': [
      'Procurement Contracts Vetted',
      'Commercial Agreements Reviewed',
      'Financing Agreements Processed',
      'Cabinet Memoranda Reviewed'
    ],
    'Legal Advisory and Research Division': [
      'Cabinet Memoranda Reviewed',
      'Legal Advisories and Opinions',
      'Memorandum of Understandings'
    ],
    'Registrar General - Societies': [
      'Society Registrations Processed',
      'Annual Returns Reviewed',
      'Compliance Certificates Issued'
    ],
    'Advocates Complaints Commission': [
      'Complaint Cases Reviewed',
      'Disciplinary Hearings Conducted',
      'Investigation Reports Prepared'
    ],
    'Public Trustee Department': [
      'Estate Administration Cases',
      'Trust Fund Management',
      'Guardianship Applications'
    ]
  };

  for (const [deptName, serviceList] of Object.entries(services)) {
    const deptId = departmentMap.get(deptName);
    if (!deptId) continue;

    console.log(`🏢 Creating services for ${deptName}:`);
    for (const serviceName of serviceList) {
      try {
        const { error } = await supabase
          .from('services')
          .upsert({
            name: serviceName,
            department_saga_id: deptId
          }, { onConflict: 'name,department_saga_id', ignoreDuplicates: true });

        if (error && !error.message.includes('duplicate key')) {
          console.error(`  ❌ ${serviceName}: ${error.message}`);
        } else {
          console.log(`  ✅ ${serviceName}`);
        }
      } catch (err) {
        console.error(`  ❌ ${serviceName}: ${err.message}`);
      }
    }
  }

  console.log(`\n🎉 Setup complete!`);
  console.log(`✅ Success: ${successCount + 1} users created`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`\n🔑 LOGIN CREDENTIALS:`);
  console.log(`👑 AG: ag@ag.go.ke | ke.AG001.AG`);
  
  const hodUsers = users.filter(u => u.category === 'HOD');
  console.log(`\n🏢 HOD Accounts:`);
  hodUsers.forEach(hod => {
    console.log(`   ${hod.email} | ke.${hod.id}.AG | ${hod.dept}`);
  });
  
  console.log(`\n👤 Sample Officer Accounts:`);
  users.filter(u => u.category === 'Officer').slice(0, 3).forEach(officer => {
    console.log(`   ${officer.email} | ke.${officer.id}.AG | ${officer.dept}`);
  });
}

async function createUser({ email, name, category, password, departmentId }) {
  try {
    // Check if auth user exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    let userId = existingUsers.users.find(u => u.email === email)?.id;

    if (!userId) {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true
      });

      if (authError) {
        console.error(`❌ Auth error for ${email}: ${authError.message}`);
        return false;
      }
      
      userId = authData.user.id;
    }

    // Create/update profile
    const { error: profileError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: email,
        full_name: name,
        county: 'NAIROBI',
        category: category,
        department_saga_id: departmentId
      }, { onConflict: 'id' });

    if (profileError) {
      console.error(`❌ Profile error for ${email}: ${profileError.message}`);
      return false;
    }

    console.log(`✅ ${email} (${category}) - ${name}`);
    return true;

  } catch (err) {
    console.error(`❌ Error creating ${email}: ${err.message}`);
    return false;
  }
}

main().catch(console.error);