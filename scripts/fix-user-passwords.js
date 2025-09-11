const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://nseovcbrrifjgyrugdwz.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zZW92Y2Jycmlmamd5cnVnZHd6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njk2MTQwOCwiZXhwIjoyMDcyNTM3NDA4fQ.boXPcBcMJIR55dLHRwcIDfl3MC42xgFC2Re6G-uj_tA'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function fixUserPasswords() {
  console.log('🔧 Fixing user passwords...')
  
  const testUsers = [
    {
      email: 'ag@ag.go.ke',
      password: 'ke.AG001.AG',
      userData: {
        full_name: 'Hon. Dorcas Oduor SC EBS OGW',
        category: 'AG',
        county: 'NAIROBI',
        department_saga_id: 1
      }
    },
    {
      email: 'hod.test@ag.go.ke', 
      password: 'ke.HOD001.AG',
      userData: {
        full_name: 'Test HOD User',
        category: 'HOD',
        county: 'NAIROBI',
        department_saga_id: 1
      }
    },
    {
      email: 'officer.test@ag.go.ke',
      password: 'ke.OFF001.AG', 
      userData: {
        full_name: 'Test Officer User',
        category: 'Officer',
        county: 'NAIROBI',
        department_saga_id: 21
      }
    }
  ]

  for (const user of testUsers) {
    try {
      console.log(`\n👤 Processing ${user.email}...`)
      
      // First, try to get the existing user
      const { data: existingUsers } = await supabase.auth.admin.listUsers()
      const existingUser = existingUsers?.users?.find(u => u.email === user.email)
      
      if (existingUser) {
        console.log(`   User exists, updating password...`)
        
        // Update user password
        const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
          existingUser.id,
          { 
            password: user.password,
            email_confirm: true
          }
        )
        
        if (updateError) {
          console.error(`   ❌ Failed to update password: ${updateError.message}`)
          continue
        }
        
        console.log(`   ✅ Password updated successfully`)
        
        // Update user profile in users table
        const { error: profileError } = await supabase
          .from('users')
          .upsert({
            id: existingUser.id,
            email: user.email,
            ...user.userData,
            updated_at: new Date().toISOString()
          })
          
        if (profileError) {
          console.error(`   ❌ Failed to update profile: ${profileError.message}`)
        } else {
          console.log(`   ✅ Profile updated successfully`)
        }
        
      } else {
        console.log(`   User doesn't exist, creating new user...`)
        
        // Create new user
        const { data: createData, error: createError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true
        })
        
        if (createError) {
          console.error(`   ❌ Failed to create user: ${createError.message}`)
          continue
        }
        
        console.log(`   ✅ User created successfully`)
        
        // Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .upsert({
            id: createData.user.id,
            email: user.email,
            ...user.userData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          
        if (profileError) {
          console.error(`   ❌ Failed to create profile: ${profileError.message}`)
        } else {
          console.log(`   ✅ Profile created successfully`)
        }
      }
      
      // Test login
      console.log(`   🔐 Testing login...`)
      const testClient = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zZW92Y2Jycmlmamd5cnVnZHd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5NjE0MDgsImV4cCI6MjA3MjUzNzQwOH0.KWkqabeCNmwapyLqM3aRS0QrWrwPHDQxPgOH3eTy6W4')
      
      const { data: loginData, error: loginError } = await testClient.auth.signInWithPassword({
        email: user.email,
        password: user.password
      })
      
      if (loginError) {
        console.error(`   ❌ Login test failed: ${loginError.message}`)
      } else {
        console.log(`   ✅ Login test successful`)
        await testClient.auth.signOut()
      }
      
    } catch (error) {
      console.error(`   ❌ Error processing ${user.email}: ${error.message}`)
    }
  }
  
  console.log('\n✨ User password fix completed!')
}

fixUserPasswords().catch(console.error)