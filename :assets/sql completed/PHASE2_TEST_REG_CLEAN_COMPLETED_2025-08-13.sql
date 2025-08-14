-- =====================================================
-- PHASE 2: CLEAN REGISTRATION FLOW TEST
-- =====================================================
-- This version tests what we can without foreign key violations

-- 1. Check current service role policies exist
SELECT 
  tablename, 
  policyname, 
  cmd,
  CASE WHEN roles @> '{service_role}'::name[] THEN 'YES' ELSE 'NO' END as service_role_access
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('clients', 'client_users', 'compliance_settings', 'profiles')
AND (roles @> '{service_role}'::name[] OR policyname LIKE '%Service role%')
ORDER BY tablename, policyname;

-- 2. Test company creation (this should work fine)
INSERT INTO clients (name, business_type, business_email, phone, subscription_status, subscription_tier, onboarding_status, estimated_monthly_deliveries) 
VALUES (
  'Test Registration Company',
  'restaurant',
  'test-reg@example.com',
  '1234567890',
  'trial',
  'basic',
  'started',
  50
) RETURNING id, name, business_type;

-- 3. Check if the company was created successfully
SELECT id, name, business_type, subscription_status 
FROM clients 
WHERE name = 'Test Registration Company';

-- 4. Test compliance settings creation (using the company ID from step 2)
-- You'll need to replace [CLIENT_ID] with the actual ID returned above
-- INSERT INTO compliance_settings (client_id, rules, alert_preferences, notification_emails)
-- VALUES (
--   '[CLIENT_ID]',
--   '{"chilled_max_temp": 4, "frozen_min_temp": -18}',
--   '{"email_alerts": true}',
--   '["test-reg@example.com"]'
-- );

-- 5. Clean up test data when done
DELETE FROM compliance_settings WHERE client_id IN (SELECT id FROM clients WHERE name = 'Test Registration Company');
DELETE FROM clients WHERE name = 'Test Registration Company';

-- 6. Verify cleanup
SELECT COUNT(*) as remaining_test_records 
FROM clients 
WHERE name = 'Test Registration Company';