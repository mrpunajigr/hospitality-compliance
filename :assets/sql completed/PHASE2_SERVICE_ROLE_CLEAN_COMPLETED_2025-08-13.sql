-- =====================================================
-- PHASE 2: CLEAN SERVICE ROLE POLICY DEPLOYMENT
-- =====================================================
-- This version handles existing policies gracefully

-- First, check what role is being used
SELECT current_user, current_setting('role');

-- Drop existing service role policies if they exist (no errors)
DROP POLICY IF EXISTS "Service role can create companies" ON clients;
DROP POLICY IF EXISTS "Service role can create client_users" ON client_users;  
DROP POLICY IF EXISTS "Service role can create compliance_settings" ON compliance_settings;
DROP POLICY IF EXISTS "Service role can create profiles" ON profiles;
DROP POLICY IF EXISTS "Service role full access clients" ON clients;
DROP POLICY IF EXISTS "Service role full access client_users" ON client_users;
DROP POLICY IF EXISTS "Service role full access compliance_settings" ON compliance_settings;
DROP POLICY IF EXISTS "Service role full access profiles" ON profiles;

-- Create comprehensive service role policies
-- These allow the service role complete access for API operations

-- Allow service role to manage clients table completely
CREATE POLICY "Service role full access clients" ON clients
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Allow service role to manage client_users table completely  
CREATE POLICY "Service role full access client_users" ON client_users
    FOR ALL
    TO service_role 
    USING (true)
    WITH CHECK (true);

-- Allow service role to manage compliance_settings table completely
CREATE POLICY "Service role full access compliance_settings" ON compliance_settings
    FOR ALL
    TO service_role
    USING (true) 
    WITH CHECK (true);

-- Allow service role to manage profiles table completely (for registration flow)
CREATE POLICY "Service role full access profiles" ON profiles
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Verify the policies were created successfully
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('clients', 'client_users', 'compliance_settings', 'profiles')
AND roles @> '{service_role}'::name[]
ORDER BY tablename, policyname;