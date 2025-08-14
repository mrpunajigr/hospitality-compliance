-- =====================================================
-- PHASE 2: VERIFY RLS POLICIES ARE WORKING
-- =====================================================
-- Run this to check if our policies were deployed correctly

-- Check all policies on our main tables
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('clients', 'client_users', 'invitations', 'compliance_settings')
ORDER BY tablename, policyname;

-- Check if service role policies exist specifically
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND policyname LIKE '%Service role%'
ORDER BY tablename, policyname;

-- Test if we can insert into clients table (should work with service role)
-- This will help us identify where exactly the failure is occurring

-- Test clients table insert (this should work)
INSERT INTO clients (name, business_type, business_email, phone, subscription_status, subscription_tier, onboarding_status, estimated_monthly_deliveries) 
VALUES ('Test Company Debug', 'restaurant', 'debug@test.com', '1234567890', 'trial', 'basic', 'started', 50)
RETURNING id, name;

-- Test client_users table insert (this is likely where it's failing)
-- We'll need to use the actual client ID from above
-- INSERT INTO client_users (user_id, client_id, role, status, joined_at) 
-- VALUES ('test-user-debug', '[CLIENT_ID_FROM_ABOVE]', 'owner', 'active', NOW());