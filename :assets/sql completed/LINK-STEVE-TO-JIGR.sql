-- Link steve@jigr.app to existing JiGR apps client via client_users junction table

-- First get your user ID and the JiGR client ID
SELECT 
  (SELECT id FROM auth.users WHERE email = 'steve@jigr.app') as user_id,
  (SELECT id FROM clients WHERE name = 'JiGR apps') as client_id;

-- Create the user-client relationship in client_users table
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
  (SELECT id FROM auth.users WHERE email = 'steve@jigr.app'),
  (SELECT id FROM clients WHERE name = 'JiGR apps'),
  'admin',
  'active',
  now(),
  now()
);

-- Verify the relationship was created
SELECT 
  cu.role,
  cu.status,
  c.name as client_name,
  u.email as user_email
FROM client_users cu
JOIN clients c ON cu.client_id = c.id  
JOIN auth.users u ON cu.user_id = u.id
WHERE u.email = 'steve@jigr.app';