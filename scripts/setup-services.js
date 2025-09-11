require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Define services for each department
const departmentServices = {
  'INTERNATIONAL LAW DIVISION': [
    'International Agreements Negotiated',
    'Treaties Drafted and Vetted', 
    'Legal Opinions on International Law',
    'Government Position Papers Prepared',
    'International Court Representations',
    'Diplomatic Consultations Conducted'
  ],
  
  'Government Transactions Division': [
    'Procurement Contracts Vetted',
    'Commercial Agreements Reviewed',
    'Financing Agreements Processed',
    'Cabinet Memoranda Reviewed',
    'Memorandums of Understanding Drafted',
    'Legal Due Diligence Reports'
  ],
  
  'Legal Advisory & Research Department': [
    'Cabinet Memoranda Reviewed',
    'Legal Advisories and Opinions',
    'Memorandum of Understandings',
    'Legal Research Reports',
    'Policy Documents Reviewed',
    'Legislative Drafting Support'
  ],
  
  'REGISTRAR GENERAL-SOCIETIES': [
    'Society Registrations Processed',
    'Society Name Reservations',
    'Annual Returns Reviewed',
    'Compliance Certificates Issued',
    'Society Amendments Processed',
    'Dissolution Orders Processed'
  ],
  
  'REGISTRAR GENERAL - SOCIETIES': [
    'Society Registrations Processed',
    'Society Name Reservations', 
    'Annual Returns Reviewed',
    'Compliance Certificates Issued',
    'Society Amendments Processed',
    'Dissolution Orders Processed'
  ],
  
  'REGISTRAR GENERAL-COLLEGE OF ARMS AND ADOPTION': [
    'Coat of Arms Applications',
    'Heraldic Designs Approved',
    'Adoption Orders Processed',
    'Certificate of Arms Issued',
    'Genealogical Research Conducted',
    'Heritage Documentation'
  ],
  
  'Advocates Complaints Commission': [
    'Complaint Cases Reviewed',
    'Disciplinary Hearings Conducted',
    'Investigation Reports Prepared',
    'Professional Conduct Reviews',
    'Sanctions Imposed',
    'Appeal Cases Processed'
  ],
  
  'Public Trustee Department': [
    'Estate Administration Cases',
    'Trust Fund Management',
    'Guardianship Applications',
    'Property Valuations Conducted',
    'Beneficiary Distributions',
    'Trust Deed Registrations'
  ]
};

async function setupServices() {
  console.log('🔄 Setting up services for departments...');
  
  // Get all departments
  const { data: departments, error: deptError } = await supabase
    .from('departments_sagas')
    .select('id, name');
  
  if (deptError) {
    console.error('❌ Error fetching departments:', deptError.message);
    return;
  }
  
  console.log(`📊 Found ${departments.length} departments`);
  
  // Create services for each department
  for (const department of departments) {
    const services = departmentServices[department.name];
    
    if (!services) {
      console.warn(`⚠️  No services defined for department: ${department.name}`);
      continue;
    }
    
    console.log(`🏢 Creating services for: ${department.name}`);
    
    for (const serviceName of services) {
      try {
        const { error: serviceError } = await supabase
          .from('services')
          .upsert({
            name: serviceName,
            department_saga_id: department.id
          }, { onConflict: 'name,department_saga_id' });
        
        if (serviceError) {
          console.error(`❌ Error creating service ${serviceName}:`, serviceError.message);
        } else {
          console.log(`  ✅ Created service: ${serviceName}`);
        }
      } catch (err) {
        console.error(`❌ Error creating service ${serviceName}:`, err.message);
      }
    }
  }
  
  // Get summary
  const { data: allServices } = await supabase
    .from('services')
    .select('id, name, department_saga_id');
  
  console.log(`\n✨ Service setup complete! Created ${allServices?.length || 0} services total`);
  
  // Print summary by department
  console.log('\n📋 SERVICES BY DEPARTMENT:');
  for (const department of departments) {
    const deptServices = allServices?.filter(s => s.department_saga_id === department.id) || [];
    console.log(`\n🏢 ${department.name} (${deptServices.length} services):`);
    deptServices.forEach(service => {
      console.log(`  • ${service.name}`);
    });
  }
}

// Run the setup
setupServices().catch(console.error);