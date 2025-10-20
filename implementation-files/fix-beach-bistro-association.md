# Associate User with Beach Bistro1

Run this in Supabase SQL Editor to associate your user with the correct client:

```sql
-- Associate your user with Beach Bistro1
INSERT INTO client_users (user_id, client_id, role, status)
VALUES (
    auth.uid(), 
    'bd784b9b-43d3-4a03-8d31-3483ba53cc22',  -- Beach Bistro1
    'OWNER', 
    'active'
)
ON CONFLICT (user_id, client_id) DO UPDATE SET 
    role = 'OWNER',
    status = 'active';

-- Verify the association
SELECT 
    auth.uid() as user_id,
    cu.client_id, 
    cu.role,
    cu.status,
    c.name as client_name
FROM client_users cu
JOIN clients c ON c.id = cu.client_id
WHERE cu.user_id = auth.uid()
AND c.name = 'Beach Bistro1';
```

After running this, the Departments toggle should work in Beach Bistro1!