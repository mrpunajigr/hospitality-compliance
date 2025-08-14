-- =====================================================
-- PHASE 2: TEST REGISTRATION FLOW
-- =====================================================
-- Quick test to verify service role policies are working

-- Check current service role policies
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('clients', 'client_users', 'compliance_settings', 'profiles')
AND (roles @> '{service_role}'::name[] OR policyname LIKE '%Service role%')
ORDER BY tablename, policyname;

-- Test the full registration flow with a dummy user
-- This simulates exactly what our API does

-- 1. Test profile creation (should work)
INSERT INTO profiles (id, email, full_name, phone, created_at, updated_at) 
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'test-flow@example.com',
  'Test Flow User',
  '1234567890',
  NOW(),
  NOW()
) 
ON CONFLICT (id) DO NOTHING;

-- 2. Test company creation (should work)
INSERT INTO clients (name, business_type, business_email, phone, subscription_status, subscription_tier, onboarding_status, estimated_monthly_deliveries) 
VALUES (
  'Test Flow Company',
  'restaurant',
  'test-flow@example.com',
  '1234567890',
  'trial',
  'basic',
  'started',
  50
) RETURNING id;

-- 3. Test user-company linking (this was failing before)
-- Replace [CLIENT_ID] with the ID returned from step 2
-- INSERT INTO client_users (user_id, client_id, role, status, joined_at) 
-- VALUES (
--   '11111111-1111-1111-1111-111111111111',
--   '[CLIENT_ID]',
--   'owner',
--   'active',
--   NOW()
-- );

-- Clean up test data
DELETE FROM client_users WHERE user_id = '11111111-1111-1111-1111-111111111111';
DELETE FROM clients WHERE name = 'Test Flow Company';
DELETE FROM profiles WHERE id = '11111111-1111-1111-1111-111111111111';