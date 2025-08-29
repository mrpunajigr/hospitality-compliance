-- CREATE TEST COMPANY FOR GOOGLE CLOUD AI DEVELOPMENT
-- This script creates a complete test company with admin user for development/testing
-- Email: dev@jigr.app | Password: dev123 (set manually in Supabase Auth)

-- =====================================================
-- 1. CREATE TEST COMPANY
-- =====================================================

INSERT INTO clients (
  id,
  name,
  business_type,
  business_email,
  phone,
  address,
  subscription_status,
  subscription_tier,
  document_limit,
  estimated_monthly_deliveries,
  onboarding_status,
  onboarding_completed_at,
  first_document_processed,
  selected_plan,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'JiGR Development Testing',
  'restaurant',
  'dev@jigr.app',
  '+1-555-DEV-TEST',
  '{"street": "123 Development Street", "city": "Test City", "state": "CA", "zip": "90210", "country": "USA"}',
  'active',
  'professional',
  1000,
  500,
  'completed',
  NOW(),
  false,
  'professional',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  business_email = EXCLUDED.business_email,
  updated_at = NOW();

-- =====================================================
-- 2. CREATE USER PROFILE 
-- =====================================================
-- Note: The actual user auth record must be created manually in Supabase Auth UI
-- This creates the profile that links to the auth user

INSERT INTO profiles (
  id,
  email,
  full_name,
  avatar_url,
  created_at,
  updated_at
) VALUES (
  '2815053e-c7bc-407f-9bf8-fbab2e744f25',
  'dev@jigr.app',
  'JiGR Development User',
  NULL,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  updated_at = NOW();

-- =====================================================
-- 3. LINK USER TO COMPANY WITH ADMIN PERMISSIONS
-- =====================================================

INSERT INTO client_users (
  id,
  user_id,
  client_id,
  role,
  status,
  joined_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440003',
  '2815053e-c7bc-407f-9bf8-fbab2e744f25',
  '550e8400-e29b-41d4-a716-446655440001',
  'owner',
  'active',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  status = EXCLUDED.status;

-- =====================================================
-- 4. VERIFICATION QUERIES
-- =====================================================

-- Verify company was created
SELECT 
  id,
  name,
  business_email,
  subscription_status,
  subscription_tier,
  onboarding_status
FROM clients 
WHERE id = '550e8400-e29b-41d4-a716-446655440001';

-- Verify user profile was created  
SELECT 
  id,
  email,
  full_name
FROM profiles 
WHERE id = '2815053e-c7bc-407f-9bf8-fbab2e744f25';

-- Verify user-company relationship
SELECT 
  cu.id,
  cu.role,
  p.email,
  c.name as company_name
FROM client_users cu
JOIN profiles p ON cu.user_id = p.id
JOIN clients c ON cu.client_id = c.id
WHERE cu.user_id = '2815053e-c7bc-407f-9bf8-fbab2e744f25'
  AND cu.client_id = '550e8400-e29b-41d4-a716-446655440001';

-- =====================================================
-- MANUAL STEPS REQUIRED AFTER RUNNING THIS SCRIPT:
-- =====================================================

/*
1. GO TO SUPABASE AUTH DASHBOARD:
   - Create new user with email: dev@jigr.app
   - Set password: dev123
   - Note the generated UUID from auth.users

2. UPDATE PROFILE ID TO MATCH AUTH UUID:
   UPDATE profiles 
   SET id = '[AUTH_USER_UUID_HERE]'
   WHERE id = '2815053e-c7bc-407f-9bf8-fbab2e744f25';

   UPDATE client_users 
   SET user_id = '[AUTH_USER_UUID_HERE]'
   WHERE user_id = '2815053e-c7bc-407f-9bf8-fbab2e744f25';

3. TEST LOGIN:
   - Go to: https://hospitality-compliance.vercel.app/signin
   - Login with: dev@jigr.app / dev123
   - Should redirect to dashboard with full access

4. TEST GOOGLE CLOUD AI WORKFLOW:
   - Upload delivery docket in console
   - Verify AI processing works
   - Check results display correctly
*/

-- =====================================================
-- NOTES FOR PRODUCTION DEPLOYMENT:
-- =====================================================

/*
- This test company provides real authentication without demo bypasses
- All upload data will persist in Supabase storage
- AI processing results will be saved to database
- Can be used for ongoing development and testing
- Remove/disable demo mode code once test company is validated
- This approach is production-safe and maintainable
*/