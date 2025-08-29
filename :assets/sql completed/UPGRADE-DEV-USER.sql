-- 👤 UPGRADE DEV USER - Convert dev@jigr.app from demo to real client user
-- This will test if authentication mode affects the persistent modal

-- Step 1: First check current dev user status
SELECT 
  u.id,
  u.email,
  u.created_at,
  c.id as client_id,
  c.name as company_name,
  c.subscription_tier,
  c.created_at as client_created_at
FROM auth.users u
LEFT JOIN clients c ON c.id::text = ANY(
  SELECT unnest(string_to_array(u.raw_user_meta_data->>'client_ids', ','))
)
WHERE u.email = 'dev@jigr.app';

-- Step 2: Create or find a real client company for dev user
-- First check if there's already a suitable client
SELECT * FROM clients 
WHERE name ILIKE '%demo%' OR name ILIKE '%dev%' OR name ILIKE '%test%'
ORDER BY created_at DESC
LIMIT 3;

-- Step 3: Create a proper client company if needed
INSERT INTO clients (
  id,
  name,
  contact_email,
  phone,
  address,
  subscription_tier,
  is_active,
  created_at,
  updated_at
) VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', -- Using existing demo client ID
  'JiGR Development Company',
  'dev@jigr.app',
  '+64 21 000 0000', 
  '123 Development St, Auckland, New Zealand',
  'enterprise',
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  contact_email = EXCLUDED.contact_email,
  subscription_tier = EXCLUDED.subscription_tier,
  updated_at = NOW();

-- Step 4: Update dev user to be linked to this client
-- Note: This depends on your user-client relationship structure
-- Adjust based on how your system links users to clients

-- If using raw_user_meta_data:
UPDATE auth.users 
SET 
  raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{client_id}',
    '"a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"'
  ),
  updated_at = NOW()
WHERE email = 'dev@jigr.app';

-- Step 5: Create user-client relationship if you have a separate table
-- INSERT INTO user_clients (user_id, client_id, role, created_at)
-- SELECT 
--   u.id,
--   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
--   'admin',
--   NOW()
-- FROM auth.users u
-- WHERE u.email = 'dev@jigr.app'
-- ON CONFLICT (user_id, client_id) DO UPDATE SET
--   role = EXCLUDED.role,
--   updated_at = NOW();

-- Step 6: Verification - Check updated user status
SELECT 
  '🎯 DEV USER UPGRADE VERIFICATION' as message,
  u.id as user_id,
  u.email,
  u.raw_user_meta_data->>'client_id' as linked_client_id,
  c.name as company_name,
  c.subscription_tier,
  CASE 
    WHEN c.id IS NOT NULL THEN '✅ REAL CLIENT USER'
    ELSE '❌ STILL DEMO USER'
  END as status
FROM auth.users u
LEFT JOIN clients c ON c.id::uuid = (u.raw_user_meta_data->>'client_id')::uuid
WHERE u.email = 'dev@jigr.app';

-- Success message
SELECT 
  '✅ DEV USER UPGRADE COMPLETE' as message,
  'dev@jigr.app is now linked to JiGR Development Company' as result,
  'Ready for authentication testing' as next_step;