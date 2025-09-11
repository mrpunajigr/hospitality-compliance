# Debug Client ID Foreign Key Issue

## The Problem
The invitation is failing with foreign key constraint violation on `invitations_client_id_fkey`. This means the `client_id` being used doesn't exist in the `clients` table.

## SQL Queries to Debug

Run these in your Supabase SQL Editor:

### 1. Check what client IDs exist in the clients table:
```sql
SELECT id, name FROM clients ORDER BY created_at DESC;
```

### 2. Check what client_id the current user is associated with:
```sql
SELECT cu.client_id, c.name, cu.role, cu.status 
FROM client_users cu
JOIN clients c ON c.id = cu.client_id  
WHERE cu.user_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'
AND cu.status = 'active';
```

### 3. If no results from query 2, check all client_users for that user:
```sql
SELECT * FROM client_users 
WHERE user_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12';
```

## Possible Solutions

1. **Create a client record** if none exists
2. **Update the client_id** in the invitation API to use a valid client ID  
3. **Create a client_users record** linking the admin user to a client

Let me know the results of these queries and I'll provide the exact fix needed.