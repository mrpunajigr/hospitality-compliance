-- Fix current user authentication by linking to JiGR client
-- This resolves the "Cannot coerce the result to a single JSON object" error

-- First check what users exist
SELECT 'Current auth users:' as info;
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- Check existing client_users relationships
SELECT 'Current client relationships:' as info;
SELECT 
  cu.user_id,
  cu.role,
  cu.status,
  u.email,
  c.name as client_name
FROM client_users cu
JOIN auth.users u ON cu.user_id = u.id
JOIN clients c ON cu.client_id = c.id;

-- Get the most recent user (likely your current login)
SELECT 'Most recent user details:' as info;
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 1;

-- Link the most recent user to JiGR client
INSERT INTO client_users (
  id,
  user_id,
  client_id,
  role,
  status,
  joined_at,
  created_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1), -- Most recent user
  'b13e93dd-e981-4d43-97e6-26b7713fb90c',  -- JiGR apps client ID
  'admin',
  'active',
  now(),
  now()
)
ON CONFLICT (user_id, client_id) DO UPDATE SET
  role = 'admin',
  status = 'active',
  joined_at = now();

-- Verify the fix worked
SELECT 'Verification - should see your email linked to JiGR apps:' as info;
SELECT 
  cu.role,
  cu.status,
  c.name as client_name,
  u.email as user_email
FROM client_users cu
JOIN clients c ON cu.client_id = c.id  
JOIN auth.users u ON cu.user_id = u.id
WHERE u.id = (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1);