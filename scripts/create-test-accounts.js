require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestAccounts() {
  console.log('🧪 Creating test accounts...\n');

  // Create a test department first
  console.log('📁 Creating test department...');
  
  // Check if department exists first
  const { data: existingDept } = await supabase
    .from('departments_sagas')
    .select('*')
    .eq('name', 'Test Department')
    .single();

  let dept;
  
  if (existingDept) {
    dept = existingDept;
    console.log('✅ Department already exists:', dept.name);
  } else {
    const { data: newDept, error: deptError } = await supabase
      .from('departments_sagas')
      .insert({
        name: 'Test Department',
        type: 'Department'
      })
      .select()
      .single();

    if (deptError) {
      console.error('❌ Error creating department:', deptError.message);
      return;
    }
    
    dept = newDept;
    console.log('✅ Department created:', dept.name);
  }

  console.log('✅ Department ready:', dept.name, '(ID:', dept.id, ')');

  const testAccounts = [
    {
      email: 'hod.test@ag.go.ke',
      password: 'ke.HOD001.AG',
      full_name: 'Test HOD User',
      category: 'HOD',
      county: 'NAIROBI'
    },
    {
      email: 'officer.test@ag.go.ke', 
      password: 'ke.OFF001.AG',
      full_name: 'Test Officer User',
      category: 'Officer',
      county: 'NAIROBI'
    }
  ];

  console.log('\n👥 Creating test user accounts...');
  
  for (const account of testAccounts) {
    try {
      // Check if user already exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers.users.find(u => u.email === account.email);
      
      let userId;
      
      if (existingUser) {
        console.log(`⚠️  Auth user ${account.email} already exists`);
        userId = existingUser.id;
      } else {
        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true
        });

        if (authError) {
          console.error(`❌ Error creating auth user ${account.email}:`, authError.message);
          continue;
        }
        
        userId = authData.user.id;
        console.log(`✅ Created auth user: ${account.email}`);
      }

      // Create/update user profile
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: userId,
          email: account.email,
          full_name: account.full_name,
          county: account.county,
          category: account.category,
          department_saga_id: dept.id
        }, { onConflict: 'id' });

      if (profileError) {
        console.error(`❌ Error creating user profile ${account.email}:`, profileError.message);
      } else {
        console.log(`✅ Created/updated profile: ${account.email} (${account.category})`);
      }

    } catch (err) {
      console.error(`❌ Error processing user ${account.email}:`, err.message);
    }
  }

  // Create some test services
  console.log('\n🔧 Creating test services...');
  const testServices = ['Document Review', 'Legal Advisory', 'Case Management'];
  
  for (const serviceName of testServices) {
    try {
      // Check if service exists first
      const { data: existingService } = await supabase
        .from('services')
        .select('*')
        .eq('name', serviceName)
        .eq('department_saga_id', dept.id)
        .single();

      if (existingService) {
        console.log(`✅ Service already exists: ${serviceName}`);
      } else {
        const { error } = await supabase
          .from('services')
          .insert({
            name: serviceName,
            department_saga_id: dept.id
          });
        
        if (error) {
          console.error(`❌ Error creating service ${serviceName}:`, error.message);
        } else {
          console.log(`✅ Created service: ${serviceName}`);
        }
      }
    } catch (err) {
      console.error(`❌ Error with service ${serviceName}:`, err.message);
    }
  }

  console.log('\n🎉 Test accounts created successfully!\n');
  console.log('📋 LOGIN CREDENTIALS:');
  console.log('👑 Attorney General: ag@ag.go.ke | Password: ke.AG001.AG');
  console.log('👨‍💼 Test HOD: hod.test@ag.go.ke | Password: ke.HOD001.AG');
  console.log('👤 Test Officer: officer.test@ag.go.ke | Password: ke.OFF001.AG');
}

createTestAccounts().catch(console.error);