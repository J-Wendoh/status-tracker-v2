require('dotenv').config({ path: '.env.local' });

console.log('🔍 Environment Variables Debug:\n');

console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set ✅' : 'Missing ❌');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set ✅' : 'Missing ❌');

console.log('\n🌐 URL Analysis:');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (url) {
  const matches = url.match(/https:\/\/(.+)\.supabase\.co/);
  if (matches) {
    console.log('Project ID:', matches[1]);
  }
  console.log('Full URL:', url);
}

console.log('\n🔑 Anon Key Analysis:');
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (anonKey) {
  try {
    // Decode JWT header to check project
    const header = JSON.parse(Buffer.from(anonKey.split('.')[0], 'base64').toString());
    const payload = JSON.parse(Buffer.from(anonKey.split('.')[1], 'base64').toString());
    console.log('Key project ref:', payload.ref);
    console.log('Key role:', payload.role);
    console.log('Key issued at:', new Date(payload.iat * 1000).toISOString());
    console.log('Key expires at:', new Date(payload.exp * 1000).toISOString());
  } catch (e) {
    console.log('Could not decode JWT:', e.message);
  }
}