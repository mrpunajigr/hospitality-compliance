# Database Audit Queries - Run These First

## 🎯 Purpose
Identify the root cause of the foreign key constraint violation by checking data relationships.

## 📋 Run These Queries in Supabase SQL Editor

### Query 1: Check what clients exist
```sql
-- 1. Check what clients exist
SELECT id, name, created_at 
FROM clients 
ORDER BY created_at DESC;
```

### Query 2: Check admin user's client association
```sql
-- 2. Check current user's client association
SELECT cu.*, c.name as client_name
FROM client_users cu
LEFT JOIN clients c ON cu.client_id = c.id
WHERE cu.user_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12';
```

### Query 3: Check all client_users relationships
```sql
-- 3. Check all client_users relationships
SELECT cu.user_id, cu.client_id, cu.status, c.name as client_name
FROM client_users cu
LEFT JOIN clients c ON cu.client_id = c.id
ORDER BY cu.created_at DESC;
```

### Query 4: Check for orphaned records
```sql
-- 4. Check for orphaned records
SELECT cu.*
FROM client_users cu
LEFT JOIN clients c ON cu.client_id = c.id
WHERE c.id IS NULL;
```

## 📊 What to Look For

1. **No clients exist**: If Query 1 returns empty, we need to create a client
2. **No client association**: If Query 2 returns empty, admin user isn't linked to any client
3. **Orphaned relationships**: If Query 4 has results, some client_users point to deleted clients

## ⏭️ Next Steps

After running these queries, share the results and I'll provide the exact fix based on what we find.