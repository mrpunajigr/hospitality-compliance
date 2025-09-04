-- Check what's in the client_users junction table
SELECT * FROM client_users;

-- If empty, create the missing relationship for dev@jigr.app
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
  '2815053e-c7bc-407f-9bf8-fbab2e744f25', -- dev@jigr.app exact ID
  'b13e93dd-e981-4d43-97e6-26b7713fb90c',  -- JiGR apps client ID
  'admin',
  'active',
  now(),
  now()
);