-- 👤 FIXED UPGRADE DEV USER - Using correct column names for clients table

-- Step 1: Check current dev user status
SELECT 
  u.id,
  u.email,
  u.created_at
FROM auth.users u
WHERE u.email = 'dev@jigr.app';

-- Step 2: Check existing clients table structure and data
SELECT * FROM clients LIMIT 3;

-- Step 3: Create/update client with CORRECT column names (avoiding contact_email)
INSERT INTO clients (
  id,
  name,
  email,  -- Using 'email' instead of 'contact_email'
  subscription_tier,
  is_active,
  created_at,
  updated_at
) VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'JiGR Development Company',
  'dev@jigr.app',
  'enterprise',
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  subscription_tier = EXCLUDED.subscription_tier,
  updated_at = NOW();

-- Step 4: Update dev user metadata to link to client
UPDATE auth.users 
SET 
  raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{client_id}',
    '"a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"'
  ),
  updated_at = NOW()
WHERE email = 'dev@jigr.app';

-- Step 5: Verification
SELECT 
  '🎯 DEV USER UPGRADE VERIFICATION' as message,
  u.id as user_id,
  u.email,
  u.raw_user_meta_data->>'client_id' as linked_client_id,
  c.name as company_name,
  c.subscription_tier
FROM auth.users u
LEFT JOIN clients c ON c.id::uuid = (u.raw_user_meta_data->>'client_id')::uuid
WHERE u.email = 'dev@jigr.app';