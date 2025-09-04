-- Fix RLS policy for departments_sagas to allow public read access
-- This is needed for the registration form to work

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "departments_sagas_select_all" ON departments_sagas;

-- Create new policy allowing public read access to departments_sagas
-- This is safe because departments_sagas contains only reference data (department/SAGA names)
-- that users need to see during registration
CREATE POLICY "departments_sagas_public_select" ON departments_sagas
    FOR SELECT USING (true);

-- Also ensure services can be read by authenticated users (keep existing policy)
DROP POLICY IF EXISTS "services_select_all" ON services;
CREATE POLICY "services_select_all" ON services
    FOR SELECT USING (auth.uid() IS NOT NULL);
