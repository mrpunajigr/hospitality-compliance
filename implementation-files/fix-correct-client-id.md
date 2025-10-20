# Fix Client ID Mismatch

## Issue
- API trying to use client_id: `bd784b9b-43d3-4a03-8d31-3483ba53cc22`
- User associated with client_id: `a83af159-c713-4f83-ad41-f8b2733a3266`

Both are "Beach Bistro1" but different IDs!

## Solution

Associate your user with the correct client ID that the authentication system is using:

```sql
-- Associate with the correct Beach Bistro1 client ID
INSERT INTO client_users (user_id, client_id, role, status)
VALUES (
    auth.uid(), 
    'a83af159-c713-4f83-ad41-f8b2733a3266',  -- Correct Beach Bistro1 ID
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
AND cu.client_id = 'a83af159-c713-4f83-ad41-f8b2733a3266';
```

After running this, the RLS policy should allow the department creation!