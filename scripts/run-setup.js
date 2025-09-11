require('dotenv').config({ path: '.env.local' });
const { execSync } = require('child_process');

async function runSetup() {
  console.log('🚀 Starting complete OAG system setup...\n');
  
  try {
    console.log('📋 Step 1: Setting up users and departments...');
    execSync('node scripts/setup-users.js', { stdio: 'inherit' });
    
    console.log('\n📋 Step 2: Setting up services...');
    execSync('node scripts/setup-services.js', { stdio: 'inherit' });
    
    console.log('\n🎉 Complete setup finished successfully!');
    console.log('\n📝 IMPORTANT NOTES:');
    console.log('• All users have been created with passwords in format: ke.[ID_NUMBER].AG');
    console.log('• HODs have been given @ag.go.ke email addresses');
    console.log('• Attorney General account: ag@ag.go.ke | Password: ke.AG001.AG');
    console.log('• All accounts are email confirmed and ready to use');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

runSetup();