-- Link dev@jigr.app user to JiGR apps client (since steve@jigr.app doesn't exist in DB)

-- Create the user-client relationship using existing dev@jigr.app user
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
  '2815053e-c7bc-407f-9bf8-fbab2e744f25', -- dev@jigr.app user ID
  'b13e93dd-e981-4d43-97e6-26b7713fb90c',  -- JiGR apps client ID
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
WHERE cu.user_id = '2815053e-c7bc-407f-9bf8-fbab2e744f25';