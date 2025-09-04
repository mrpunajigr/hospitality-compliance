-- Check what's actually in the client_users junction table
SELECT 
  cu.user_id,
  cu.client_id,
  cu.role,
  cu.status,
  u.email,
  c.name as client_name
FROM client_users cu
JOIN auth.users u ON cu.user_id = u.id
JOIN clients c ON cu.client_id = c.id;

-- Check if dev@jigr.app user exists and get exact ID
SELECT id, email FROM auth.users WHERE email = 'dev@jigr.app';