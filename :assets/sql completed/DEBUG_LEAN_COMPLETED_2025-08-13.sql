-- Quick getUserClient debug

-- Check if user has company
SELECT COUNT(*) as user_company_count FROM client_users WHERE status = 'active';

-- Check recent companies
SELECT name, business_type FROM clients ORDER BY created_at DESC LIMIT 2;

-- Test basic join
SELECT c.name, cu.role FROM client_users cu 
JOIN clients c ON cu.client_id = c.id 
WHERE cu.status = 'active' LIMIT 1;