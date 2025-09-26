# Fix Client Association - Link Admin User to Client

## 🎯 Issue
Admin user `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12` has no client association, causing foreign key errors.

## 💡 Solution
Link the admin user to the most recent client: **"JiGR Testing Co"** (`550ab643-4c56-41f7-a063-ec9001b8497b`)

## 🔧 SQL to Run in Supabase

```sql
INSERT INTO client_users (user_id, client_id, role, status, created_at)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
  '550ab643-4c56-41f7-a063-ec9001b8497b',
  'admin',
  'active',
  now()
)
ON CONFLICT (user_id, client_id) DO UPDATE SET
  status = 'active',
  role = 'admin';
```

## ✅ Verification Query
After running the fix, verify it worked:

```sql
-- Confirm admin user now has client association
SELECT 
  cu.user_id,
  cu.client_id, 
  cu.role,
  cu.status,
  c.name as client_name
FROM client_users cu
JOIN clients c ON cu.client_id = c.id
WHERE cu.user_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12';
```

**Expected Result:**
- user_id: `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12`
- client_id: `550ab643-4c56-41f7-a063-ec9001b8497b`  
- role: `admin`
- status: `active`
- client_name: `JiGR Testing Co`

## ⏭️ Next Steps
Once this SQL is executed successfully, we'll move to Phase 3 to update the API logic.