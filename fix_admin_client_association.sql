-- Fix Admin Client Association
-- Links real user 2815053e-c7bc-407f-9bf8-fbab2e744f25 (dev@jigr.app) to JiGR Testing Co client

INSERT INTO client_users (user_id, client_id, role, status, created_at)
VALUES (
  '2815053e-c7bc-407f-9bf8-fbab2e744f25',
  '550ab643-4c56-41f7-a063-ec9001b8497b',
  'OWNER',
  'active',
  now()
)
ON CONFLICT (user_id, client_id) DO UPDATE SET
  status = 'active',
  role = 'OWNER';