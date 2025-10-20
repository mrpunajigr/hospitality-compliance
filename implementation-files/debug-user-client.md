# Debug User Client Association

## Check User Client Data

Run this in Supabase SQL Editor to check if your user has proper client association:

```sql
-- Check your current user ID
SELECT auth.uid() as current_user_id;

-- Check if you're in client_users table
SELECT 
    cu.user_id,
    cu.client_id, 
    cu.role,
    cu.status,
    c.name as client_name
FROM client_users cu
LEFT JOIN clients c ON c.id = cu.client_id
WHERE cu.user_id = auth.uid();

-- Check if clients table has data
SELECT id, name, created_at FROM clients LIMIT 5;

-- Test RLS policy for business_departments
SELECT 
    'Can insert departments?' as test,
    client_id 
FROM client_users 
WHERE user_id = auth.uid() 
AND role IN ('MANAGER', 'OWNER', 'CHAMPION')
AND status = 'active';
```

## Expected Results

You should see:
1. Your user_id (UUID)
2. A client_id associated with your user
3. A role like 'OWNER', 'MANAGER', or 'CHAMPION'
4. Status = 'active'

## If Missing Client Association

If you don't have a client association, we need to create one:

```sql
-- Create a test client (if none exists)
INSERT INTO clients (name, business_type) 
VALUES ('Test Business', 'restaurant') 
ON CONFLICT DO NOTHING
RETURNING id;

-- Associate your user with the client (replace client-id-here with actual ID)
INSERT INTO client_users (user_id, client_id, role, status)
VALUES (auth.uid(), 'client-id-here', 'OWNER', 'active')
ON CONFLICT (user_id, client_id) DO UPDATE SET 
    role = 'OWNER',
    status = 'active';
```