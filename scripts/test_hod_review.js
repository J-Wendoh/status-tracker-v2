const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testHodReviewSystem() {
  console.log('🧪 Testing HOD Review System\n');
  console.log('='*50);

  try {
    // 1. Check if we have any activities to review
    console.log('\n📋 Fetching activities...');
    const { data: activities, error: actError } = await supabase
      .from('activities')
      .select(`
        *,
        users!inner(full_name, email),
        services!inner(name),
        activity_status(*)
      `)
      .limit(5);

    if (actError) {
      console.error('Error fetching activities:', actError);
      return;
    }

    console.log(`Found ${activities.length} activities`);

    if (activities.length > 0) {
      const activity = activities[0];
      console.log('\n📝 Testing review for activity:');
      console.log(`  - ID: ${activity.id}`);
      console.log(`  - User: ${activity.users.full_name}`);
      console.log(`  - Service: ${activity.services.name}`);
      console.log(`  - Count: ${activity.count}`);

      // 2. Simulate HOD review with comment
      console.log('\n💬 Adding HOD review...');

      // Check if status already exists
      const existingStatus = activity.activity_status?.[0];

      const reviewData = {
        activity_id: activity.id,
        status: 'complete',
        hod_comment: 'Excellent work! All requirements have been met. Keep up the good work.',
        hod_reviewed: true,
        hod_reviewed_at: new Date().toISOString(),
        pending_count: 0,
        completed_count: activity.count
      };

      if (existingStatus) {
        // Update existing status
        const { data: updatedStatus, error: updateError } = await supabase
          .from('activity_status')
          .update(reviewData)
          .eq('id', existingStatus.id)
          .select();

        if (updateError) {
          console.error('Error updating status:', updateError);
        } else {
          console.log('✅ Successfully updated activity status with HOD review');
        }
      } else {
        // Create new status
        const { data: newStatus, error: createError } = await supabase
          .from('activity_status')
          .insert(reviewData)
          .select();

        if (createError) {
          console.error('Error creating status:', createError);
        } else {
          console.log('✅ Successfully created activity status with HOD review');
        }
      }

      // 3. Test incomplete status with comment
      console.log('\n📝 Testing incomplete status...');

      if (activities.length > 1) {
        const secondActivity = activities[1];

        const incompleteReview = {
          activity_id: secondActivity.id,
          status: 'incomplete',
          hod_comment: 'Please provide more detailed information about the activities performed. The count seems low for the reporting period.',
          hod_reviewed: true,
          hod_reviewed_at: new Date().toISOString(),
          pending_count: secondActivity.count,
          completed_count: 0
        };

        const { error: incompleteError } = await supabase
          .from('activity_status')
          .upsert(incompleteReview, { onConflict: 'activity_id' });

        if (incompleteError) {
          console.error('Error creating incomplete status:', incompleteError);
        } else {
          console.log('✅ Successfully added incomplete status with feedback');
        }
      }

      // 4. Verify the reviews
      console.log('\n🔍 Verifying reviews...');
      const { data: reviewedActivities, error: verifyError } = await supabase
        .from('activity_status')
        .select(`
          *,
          activities!inner(
            description,
            users!inner(full_name),
            services!inner(name)
          )
        `)
        .eq('hod_reviewed', true)
        .order('hod_reviewed_at', { ascending: false })
        .limit(5);

      if (verifyError) {
        console.error('Error verifying reviews:', verifyError);
      } else {
        console.log(`\n📊 Recent HOD Reviews (${reviewedActivities.length} total):`);
        console.log('='*50);

        reviewedActivities.forEach((review, index) => {
          console.log(`\n${index + 1}. ${review.activities.users.full_name} - ${review.activities.services.name}`);
          console.log(`   Status: ${review.status.toUpperCase()}`);
          console.log(`   Comment: ${review.hod_comment || 'No comment'}`);
          console.log(`   Reviewed: ${new Date(review.hod_reviewed_at).toLocaleString()}`);
        });
      }

    } else {
      console.log('\n⚠️  No activities found to test. Please create some activities first.');
    }

    // 5. Check database schema
    console.log('\n🔧 Verifying database schema...');
    const { data: columns, error: schemaError } = await supabase
      .rpc('get_columns', {
        table_name: 'activity_status',
        schema_name: 'public'
      })
      .select();

    if (!schemaError) {
      console.log('\n✅ activity_status table columns:');
      const relevantColumns = ['status', 'hod_comment', 'hod_reviewed', 'hod_reviewed_at'];
      relevantColumns.forEach(col => {
        const found = columns?.find(c => c.column_name === col);
        if (found) {
          console.log(`   ✓ ${col} - ${found.data_type}`);
        } else {
          console.log(`   ✗ ${col} - NOT FOUND`);
        }
      });
    }

    console.log('\n✅ HOD Review System Test Complete!');
    console.log('\n📱 To test in the browser:');
    console.log('1. Open http://localhost:3000');
    console.log('2. Login as HOD using: hod.test@ag.go.ke');
    console.log('3. Navigate to Activities section');
    console.log('4. Click "Update Status" on any activity');
    console.log('5. Select Complete/Incomplete and add a comment');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
  }
}

// Execute test
testHodReviewSystem();