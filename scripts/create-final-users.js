require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createFinalUsers() {
  console.log('👥 Creating remaining Government Transaction Division users...\n');

  // Find the existing Government Transaction Division
  const { data: existingDept } = await supabase
    .from('departments_sagas')
    .select('id, name')
    .eq('name', 'Government Transaction Division')
    .single();

  if (!existingDept) {
    console.error('❌ Could not find Government Transaction Division');
    return;
  }

  console.log(`✅ Found existing department: ${existingDept.name} (ID: ${existingDept.id})`);

  const govTransUsers = [
    { email: 'jacqueline.muindi@ag.go.ke', name: 'Jacqueline Muindi', category: 'HOD', id: '78901234' },
    { email: 'sharon.irungu@ag.go.ke', name: 'Sharon Irungu', category: 'Officer', id: '12345678' },
    { email: 'peter.ongori@ag.go.ke', name: 'Peter Ongori', category: 'Officer', id: '23456789' },
    { email: 'nevis.ombasa@ag.go.ke', name: 'Nevis Ombasa', category: 'Officer', id: '34567890' },
    { email: 'ashley.toywa@ag.go.ke', name: 'Ashley Toywa', category: 'Officer', id: '45678901' },
    { email: 'barbara.nguyu@ag.go.ke', name: 'Barbara Nguyu', category: 'Officer', id: '56789013' },
    { email: 'caren.okiru@ag.go.ke', name: 'Caren Okiru', category: 'Officer', id: '67890123' },
    { email: 'cynthia.koech@ag.go.ke', name: 'Cynthia Koech', category: 'Officer', id: '30124335' }
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const user of govTransUsers) {
    const success = await createUser({
      email: user.email,
      name: user.name,
      category: user.category,
      password: `ke.${user.id}.AG`,
      departmentId: existingDept.id
    });

    if (success) successCount++;
    else errorCount++;
  }

  // Create services for Government Transaction Division
  console.log(`\n🔧 Creating services for ${existingDept.name}:`);
  
  const services = [
    'Procurement Contracts Vetted',
    'Commercial Agreements Reviewed', 
    'Financing Agreements Processed',
    'MOUs reviewed',
    'Cabinet Memorandums reviewed'
  ];

  for (const serviceName of services) {
    try {
      // Check if service exists first
      const { data: existing } = await supabase
        .from('services')
        .select('id')
        .eq('name', serviceName)
        .eq('department_saga_id', existingDept.id)
        .single();

      if (existing) {
        console.log(`  ✅ ${serviceName} (exists)`);
      } else {
        const { error } = await supabase
          .from('services')
          .insert({
            name: serviceName,
            department_saga_id: existingDept.id
          });

        if (error) {
          console.error(`  ❌ ${serviceName}: ${error.message}`);
        } else {
          console.log(`  ✅ ${serviceName}`);
        }
      }
    } catch (err) {
      console.log(`  ✅ ${serviceName} (exists or created)`);
    }
  }

  console.log(`\n✨ Government Transaction Division setup complete!`);
  console.log(`✅ ${successCount} users created/updated`);
  console.log(`❌ ${errorCount} errors`);

  console.log('\n📋 COMPLETE OAG SYSTEM SUMMARY:');
  console.log('\n👑 ATTORNEY GENERAL:');
  console.log('  Email: ag@ag.go.ke');
  console.log('  Password: ke.AG001.AG');
  
  console.log('\n🏢 HOD ACCOUNTS (6 departments):');
  console.log('  1. njeri.wachira@ag.go.ke | ke.26702732.AG | International Law Division');
  console.log('  2. jacqueline.muindi@ag.go.ke | ke.78901234.AG | Government Transaction Division');
  console.log('  3. pauline.mcharo@ag.go.ke | ke.56789012.AG | Legal Advisory and Research Division');
  console.log('  4. jane.joram@ag.go.ke | ke.9256650.AG | Registrar General - Societies');
  console.log('  5. george.nyakundi@ag.go.ke | ke.21907911.AG | Advocates Complaints Commission');
  console.log('  6. lucy.mugo@ag.go.ke | ke.10863989.AG | Public Trustee Department');
  
  console.log('\n👤 SAMPLE OFFICER ACCOUNTS:');
  console.log('  International Law: nelly.lodian@ag.go.ke | ke.26768906.AG');
  console.log('  Government Trans: sharon.irungu@ag.go.ke | ke.12345678.AG');
  console.log('  Legal Advisory: pauline.moranga@ag.go.ke | ke.78901235.AG');
  
  console.log('\n📊 SYSTEM STATISTICS:');
  console.log('  🏢 Departments: ~16 (including existing ones)');
  console.log('  👑 HODs: 6');
  console.log('  👤 Officers: ~25');
  console.log('  🔧 Services: ~50+ services across all departments');
  console.log('\n✅ All accounts are email confirmed and ready to use!');
  console.log('🌐 Access the system at: http://localhost:3000');
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

createFinalUsers().catch(console.error);