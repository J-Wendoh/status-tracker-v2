-- Fix infinite recursion in RLS policies by simplifying user policies

-- Drop existing problematic policies
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "activities_select_policy" ON activities;
DROP POLICY IF EXISTS "activities_update_policy" ON activities;

-- Simplified users SELECT policy without self-referencing recursion
CREATE POLICY "users_select_own" ON users
    FOR SELECT USING (
        auth.uid() = id OR 
        auth.jwt() ->> 'user_metadata' ->> 'category' IN ('HOD', 'CEO', 'AG')
    );

-- Simplified activities SELECT policy using auth metadata instead of users table lookup
CREATE POLICY "activities_select_policy" ON activities
    FOR SELECT USING (
        user_id = auth.uid() OR
        auth.jwt() ->> 'user_metadata' ->> 'category' IN ('HOD', 'CEO', 'AG')
    );

-- Simplified activities UPDATE policy using auth metadata
CREATE POLICY "activities_update_policy" ON activities
    FOR UPDATE USING (
        user_id = auth.uid() OR
        auth.jwt() ->> 'user_metadata' ->> 'category' IN ('HOD', 'CEO', 'AG')
    );
