-- Complete OAG Activity System Database Setup
-- Run this script ONCE to set up everything

-- Drop existing tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS activity_status CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS departments_sagas CASCADE;

-- Create departments_sagas table
CREATE TABLE departments_sagas (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Department', 'SAGA')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create services table
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    department_saga_id INTEGER REFERENCES departments_sagas(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    county VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Officer', 'HOD', 'CEO', 'AG')),
    department_saga_id INTEGER REFERENCES departments_sagas(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activities table
CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activity_status table
CREATE TABLE activity_status (
    id SERIAL PRIMARY KEY,
    activity_id INTEGER REFERENCES activities(id) ON DELETE CASCADE,
    updated_by UUID REFERENCES users(id),
    pending_count INTEGER DEFAULT 0,
    completed_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert seed data for departments and SAGAs
INSERT INTO departments_sagas (name, type) VALUES
-- Departments
('Department of Civil Litigation', 'Department'),
('Department of Criminal Prosecution', 'Department'),
('Department of Legal Advisory', 'Department'),
('Department of Public Interest Litigation', 'Department'),
('Department of Commercial Law', 'Department'),
('Department of Constitutional Affairs', 'Department'),
('Department of International Law', 'Department'),
('Department of Human Rights', 'Department'),
('Department of Environmental Law', 'Department'),
('Department of Administrative Law', 'Department'),

-- SAGAs
('SAGA for Anti-Corruption', 'SAGA'),
('SAGA for Economic Crimes', 'SAGA'),
('SAGA for Cybercrime', 'SAGA'),
('SAGA for Terrorism and National Security', 'SAGA'),
('SAGA for Gender-Based Violence', 'SAGA'),
('SAGA for Child Protection', 'SAGA'),
('SAGA for Wildlife and Environmental Crimes', 'SAGA'),
('SAGA for Financial Crimes', 'SAGA'),
('SAGA for Organized Crime', 'SAGA'),
('SAGA for Public Participation', 'SAGA');

-- Insert services for each department/SAGA
INSERT INTO services (name, department_saga_id) VALUES
-- Civil Litigation Services
('Civil Case Filing', (SELECT id FROM departments_sagas WHERE name = 'Department of Civil Litigation')),
('Contract Dispute Resolution', (SELECT id FROM departments_sagas WHERE name = 'Department of Civil Litigation')),
('Property Law Cases', (SELECT id FROM departments_sagas WHERE name = 'Department of Civil Litigation')),
('Employment Law Cases', (SELECT id FROM departments_sagas WHERE name = 'Department of Civil Litigation')),

-- Criminal Prosecution Services
('Criminal Case Prosecution', (SELECT id FROM departments_sagas WHERE name = 'Department of Criminal Prosecution')),
('Appeal Handling', (SELECT id FROM departments_sagas WHERE name = 'Department of Criminal Prosecution')),
('Witness Protection', (SELECT id FROM departments_sagas WHERE name = 'Department of Criminal Prosecution')),
('Evidence Review', (SELECT id FROM departments_sagas WHERE name = 'Department of Criminal Prosecution')),

-- Legal Advisory Services
('Legal Opinion Drafting', (SELECT id FROM departments_sagas WHERE name = 'Department of Legal Advisory')),
('Policy Review', (SELECT id FROM departments_sagas WHERE name = 'Department of Legal Advisory')),
('Legislative Drafting', (SELECT id FROM departments_sagas WHERE name = 'Department of Legal Advisory')),
('Government Consultation', (SELECT id FROM departments_sagas WHERE name = 'Department of Legal Advisory')),

-- Anti-Corruption SAGA Services
('Corruption Investigation', (SELECT id FROM departments_sagas WHERE name = 'SAGA for Anti-Corruption')),
('Asset Recovery', (SELECT id FROM departments_sagas WHERE name = 'SAGA for Anti-Corruption')),
('Integrity Assessment', (SELECT id FROM departments_sagas WHERE name = 'SAGA for Anti-Corruption')),
('Prevention Programs', (SELECT id FROM departments_sagas WHERE name = 'SAGA for Anti-Corruption')),

-- Economic Crimes SAGA Services
('Financial Fraud Investigation', (SELECT id FROM departments_sagas WHERE name = 'SAGA for Economic Crimes')),
('Money Laundering Cases', (SELECT id FROM departments_sagas WHERE name = 'SAGA for Economic Crimes')),
('Tax Evasion Cases', (SELECT id FROM departments_sagas WHERE name = 'SAGA for Economic Crimes')),
('Corporate Crime Investigation', (SELECT id FROM departments_sagas WHERE name = 'SAGA for Economic Crimes'));

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments_sagas ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_insert_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "activities_select_policy" ON activities;
DROP POLICY IF EXISTS "activities_insert_policy" ON activities;
DROP POLICY IF EXISTS "activities_update_policy" ON activities;
DROP POLICY IF EXISTS "activity_status_select_policy" ON activity_status;
DROP POLICY IF EXISTS "activity_status_insert_policy" ON activity_status;
DROP POLICY IF EXISTS "activity_status_update_policy" ON activity_status;
DROP POLICY IF EXISTS "services_select_all" ON services;
DROP POLICY IF EXISTS "departments_sagas_select_all" ON departments_sagas;

-- Create RLS policies for users table
CREATE POLICY "users_select_own" ON users
    FOR SELECT USING (
        auth.uid() = id OR 
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.category IN ('HOD', 'CEO', 'AG')
            AND (u.category = 'AG' OR u.department_saga_id = users.department_saga_id)
        )
    );

CREATE POLICY "users_insert_own" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for activities table
CREATE POLICY "activities_select_policy" ON activities
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users u1, users u2
            WHERE u1.id = auth.uid() 
            AND u2.id = activities.user_id
            AND u1.category IN ('HOD', 'CEO', 'AG')
            AND (u1.category = 'AG' OR u1.department_saga_id = u2.department_saga_id)
        )
    );

CREATE POLICY "activities_insert_policy" ON activities
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "activities_update_policy" ON activities
    FOR UPDATE USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users u1, users u2
            WHERE u1.id = auth.uid() 
            AND u2.id = activities.user_id
            AND u1.category IN ('HOD', 'CEO', 'AG')
            AND (u1.category = 'AG' OR u1.department_saga_id = u2.department_saga_id)
        )
    );

-- Create RLS policies for activity_status table
CREATE POLICY "activity_status_select_policy" ON activity_status
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM activities a, users u1
            WHERE a.id = activity_status.activity_id
            AND u1.id = auth.uid()
            AND (a.user_id = auth.uid() OR u1.category IN ('HOD', 'CEO', 'AG'))
        )
    );

CREATE POLICY "activity_status_insert_policy" ON activity_status
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.category IN ('HOD', 'CEO', 'AG')
        )
    );

CREATE POLICY "activity_status_update_policy" ON activity_status
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.category IN ('HOD', 'CEO', 'AG')
        )
    );

-- Create RLS policies for services and departments_sagas (read-only for all authenticated users)
CREATE POLICY "services_select_all" ON services
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "departments_sagas_select_all" ON departments_sagas
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_department_saga ON users(department_saga_id);
CREATE INDEX IF NOT EXISTS idx_users_category ON users(category);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_service_id ON activities(service_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_status_activity_id ON activity_status(activity_id);
CREATE INDEX IF NOT EXISTS idx_services_department_saga_id ON services(department_saga_id);

-- Create function to handle user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- This will be handled by the application, not the trigger
    -- Just return the new record
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
