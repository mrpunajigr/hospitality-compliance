# Clean Database Setup - Fresh Start

## 🎯 Plan: Start Fresh with Clean Live Data

Instead of debugging messy test data, let's create a clean, production-ready database structure.

## Step 1: Clean Up Test Data

```sql
-- Remove all test invitations
DELETE FROM invitations;

-- Remove all test client_users relationships  
DELETE FROM client_users;

-- Remove all test clients
DELETE FROM clients;
```

## Step 2: Create Live Company

```sql
-- Create the real JiGR company
INSERT INTO clients (id, name, type, status, created_at, updated_at)
VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',  -- Fixed UUID for JiGR
  'JiGR Hospitality Compliance',
  'restaurant', 
  'active',
  now(),
  now()
);
```

## Step 3: Link Real User to Live Company

```sql
-- Link dev@jigr.app user to JiGR company as OWNER
INSERT INTO client_users (user_id, client_id, role, status, created_at)
VALUES (
  '2815053e-c7bc-407f-9bf8-fbab2e744f25',  -- Real user from profiles
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',  -- JiGR company
  'OWNER',
  'active', 
  now()
);
```

## Step 4: Verify Clean Setup

```sql
-- Verify the clean setup
SELECT 
  u.email,
  cu.role,
  c.name as company_name,
  cu.status
FROM profiles u
JOIN client_users cu ON u.id = cu.user_id
JOIN clients c ON cu.client_id = c.id
WHERE u.email = 'dev@jigr.app';
```

## Expected Result
- ✅ One clean company: "JiGR Hospitality Compliance"
- ✅ One user: dev@jigr.app as OWNER
- ✅ Clean data relationships
- ✅ No conflicting test records

## Ready to Test
Once this clean setup is complete, the invitation system should work perfectly with no foreign key issues.

Would you like to proceed with this clean slate approach?