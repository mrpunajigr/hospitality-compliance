-- Debug what client_id the API should be using
-- Run this to see what client the user will get from the API query

SELECT 
  cu.client_id,
  c.name as client_name,
  cu.role,
  cu.status
FROM client_users cu
JOIN clients c ON cu.client_id = c.id
WHERE cu.user_id = '2815053e-c7bc-407f-9bf8-fbab2e744f25'
  AND cu.status = 'active'
ORDER BY cu.created_at DESC
LIMIT 1;