-- Verify Admin Client Association
-- Confirms real user is now linked to JiGR Testing Co client

SELECT 
  cu.user_id,
  cu.client_id, 
  cu.role,
  cu.status,
  c.name as client_name
FROM client_users cu
JOIN clients c ON cu.client_id = c.id
WHERE cu.user_id = '2815053e-c7bc-407f-9bf8-fbab2e744f25';