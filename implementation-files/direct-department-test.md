# Direct Department Insert Test

Run this in Supabase SQL Editor to test department creation directly:

```sql
-- Test direct insert to see if basic database operation works
INSERT INTO business_departments (
    client_id,
    name,
    description,
    security_level,
    created_by,
    updated_by
) VALUES (
    'bd784b9b-43d3-4a03-8d31-3483ba53cc22',  -- Beach Bistro1
    'Test Kitchen Direct',
    'Direct database test',
    'medium',
    auth.uid(),
    auth.uid()
) RETURNING id, name, client_id, security_level;

-- Check if it was created
SELECT * FROM business_departments 
WHERE client_id = 'bd784b9b-43d3-4a03-8d31-3483ba53cc22';
```

## If This Works

If the direct insert works, the issue is in the API code.

## If This Fails

If the direct insert fails, it's a database constraint issue.

Please run this test AND check your terminal for the detailed error logs!