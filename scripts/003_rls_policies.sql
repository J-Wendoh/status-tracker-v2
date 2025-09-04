-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments_sagas ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_status ENABLE ROW LEVEL SECURITY;

-- Users table policies
-- Officers can only view/update their own profile
CREATE POLICY "users_select_own" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- HOD/CEO can view users in their department/saga
CREATE POLICY "users_select_hod_ceo" ON users FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.id = auth.uid() 
    AND u.role = 'hod_ceo' 
    AND u.department_or_saga_id = users.department_or_saga_id
  )
);

-- AG can view all users
CREATE POLICY "users_select_ag" ON users FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.id = auth.uid() 
    AND u.role = 'ag'
  )
);

-- Departments and SAGAs - readable by all authenticated users
CREATE POLICY "departments_sagas_select_all" ON departments_sagas FOR SELECT USING (auth.uid() IS NOT NULL);

-- Services - readable by all authenticated users
CREATE POLICY "services_select_all" ON services FOR SELECT USING (auth.uid() IS NOT NULL);

-- Activities table policies
-- Officers can only view/insert their own activities
CREATE POLICY "activities_select_own" ON activities FOR SELECT USING (auth.uid() = officer_id);
CREATE POLICY "activities_insert_own" ON activities FOR INSERT WITH CHECK (auth.uid() = officer_id);
CREATE POLICY "activities_update_own" ON activities FOR UPDATE USING (auth.uid() = officer_id);

-- HOD/CEO can view activities in their department/saga
CREATE POLICY "activities_select_hod_ceo" ON activities FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users u 
    JOIN users officer ON officer.id = activities.officer_id
    WHERE u.id = auth.uid() 
    AND u.role = 'hod_ceo' 
    AND u.department_or_saga_id = officer.department_or_saga_id
  )
);

-- AG can view all activities
CREATE POLICY "activities_select_ag" ON activities FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.id = auth.uid() 
    AND u.role = 'ag'
  )
);

-- Activity Status table policies
-- HOD/CEO can insert/update status for activities in their department/saga
CREATE POLICY "activity_status_insert_hod_ceo" ON activity_status FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u 
    JOIN activities a ON a.id = activity_status.activity_id
    JOIN users officer ON officer.id = a.officer_id
    WHERE u.id = auth.uid() 
    AND u.role = 'hod_ceo' 
    AND u.department_or_saga_id = officer.department_or_saga_id
  )
);

CREATE POLICY "activity_status_update_hod_ceo" ON activity_status FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM users u 
    JOIN activities a ON a.id = activity_status.activity_id
    JOIN users officer ON officer.id = a.officer_id
    WHERE u.id = auth.uid() 
    AND u.role = 'hod_ceo' 
    AND u.department_or_saga_id = officer.department_or_saga_id
  )
);

-- Officers can view status of their own activities
CREATE POLICY "activity_status_select_officer" ON activity_status FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM activities a 
    WHERE a.id = activity_status.activity_id 
    AND a.officer_id = auth.uid()
  )
);

-- HOD/CEO can view status in their department/saga
CREATE POLICY "activity_status_select_hod_ceo" ON activity_status FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users u 
    JOIN activities a ON a.id = activity_status.activity_id
    JOIN users officer ON officer.id = a.officer_id
    WHERE u.id = auth.uid() 
    AND u.role = 'hod_ceo' 
    AND u.department_or_saga_id = officer.department_or_saga_id
  )
);

-- AG can view all activity status
CREATE POLICY "activity_status_select_ag" ON activity_status FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.id = auth.uid() 
    AND u.role = 'ag'
  )
);

-- AG can insert/update any activity status
CREATE POLICY "activity_status_insert_ag" ON activity_status FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.id = auth.uid() 
    AND u.role = 'ag'
  )
);

CREATE POLICY "activity_status_update_ag" ON activity_status FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.id = auth.uid() 
    AND u.role = 'ag'
  )
);
