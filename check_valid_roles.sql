-- Check what roles are currently being used
SELECT DISTINCT role 
FROM client_users 
WHERE role IS NOT NULL;