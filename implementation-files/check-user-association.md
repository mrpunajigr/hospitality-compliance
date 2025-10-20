# Check User Association

Run this query in Supabase SQL Editor:

```sql
-- Check your current user ID and client association
SELECT 
    auth.uid() as current_user_id,
    cu.client_id, 
    cu.role,
    cu.status,
    c.name as client_name
FROM client_users cu
JOIN clients c ON c.id = cu.client_id
WHERE cu.user_id = auth.uid();
```

## If No Results

If the query returns no rows, you need to associate your user with a client:

```sql
-- Associate your user with the first client (Corellis 83)
INSERT INTO client_users (user_id, client_id, role, status)
VALUES (
    auth.uid(), 
    'dcea74d0-a187-4bfc-a55c-50c6cd8cf76c',  -- Corellis 83
    'OWNER', 
    'active'
)
ON CONFLICT (user_id, client_id) DO UPDATE SET 
    role = 'OWNER',
    status = 'active';
```

## Test Department Creation

After confirming user association, test with this simple insert:

```sql
-- Test direct department insert
INSERT INTO business_departments (
    client_id, 
    name, 
    security_level,
    created_by,
    updated_by
) VALUES (
    (SELECT client_id FROM client_users WHERE user_id = auth.uid() LIMIT 1),
    'Test Kitchen',
    'medium',
    auth.uid(),
    auth.uid()
);
```

Run the first query and let me know the results!