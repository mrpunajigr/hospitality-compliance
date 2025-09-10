-- Link test@jigr.app user to JiGR client for full app access

-- Check if test@jigr.app user exists
SELECT 'Checking for test@jigr.app user:' as info;
SELECT id, email, created_at FROM auth.users WHERE email = 'test@jigr.app';

-- Check current client relationships
SELECT 'Current client relationships:' as info;
SELECT 
  cu.user_id,
  cu.role,
  cu.status,
  u.email,
  c.name as client_name
FROM client_users cu
JOIN auth.users u ON cu.user_id = u.id
JOIN clients c ON cu.client_id = c.id
WHERE u.email = 'test@jigr.app';

-- Link test@jigr.app to JiGR client
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
  (SELECT id FROM auth.users WHERE email = 'test@jigr.app'),
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

-- Verify the link was created
SELECT 'Verification - test@jigr.app should now be linked:' as info;
SELECT 
  cu.role,
  cu.status,
  c.name as client_name,
  u.email as user_email
FROM client_users cu
JOIN clients c ON cu.client_id = c.id  
JOIN auth.users u ON cu.user_id = u.id
WHERE u.email = 'test@jigr.app';