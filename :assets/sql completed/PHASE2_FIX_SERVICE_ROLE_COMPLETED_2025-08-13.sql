-- =====================================================
-- PHASE 2: FIX SERVICE ROLE POLICIES FOR COMPANY CREATION
-- =====================================================

-- The issue is that service role policies need to be more explicit
-- Let's add comprehensive service role policies that bypass RLS entirely

-- First, check what role is being used
SELECT current_user, current_setting('role');

-- Drop existing service role policies and recreate them more explicitly
DROP POLICY IF EXISTS "Service role can create companies" ON clients;
DROP POLICY IF EXISTS "Service role can create client_users" ON client_users;  
DROP POLICY IF EXISTS "Service role can create compliance_settings" ON compliance_settings;
DROP POLICY IF EXISTS "Service role can create profiles" ON profiles;

-- Create more explicit service role policies
-- These should work for the service role key used in API routes

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

-- Verify the policies were created
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('clients', 'client_users', 'compliance_settings', 'profiles')
AND roles @> '{service_role}'::name[]
ORDER BY tablename, policyname;