# JiGR Invitation System - Debug & Fix Plan

## 🎯 Issue Summary
Foreign key constraint violation: `invitations_client_id_fkey` - trying to create invitations with non-existent client_id.

## 🔍 Phase 1: Database Audit (Do This First)

### Step 1: Check Current Data State
Run these queries in Supabase SQL Editor:

```sql
-- 1. Check what clients exist
SELECT id, name, created_at 
FROM clients 
ORDER BY created_at DESC;

-- 2. Check current user's client association
SELECT cu.*, c.name as client_name
FROM client_users cu
LEFT JOIN clients c ON cu.client_id = c.id
WHERE cu.user_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12';

-- 3. Check all client_users relationships
SELECT cu.user_id, cu.client_id, cu.status, c.name as client_name
FROM client_users cu
LEFT JOIN clients c ON cu.client_id = c.id
ORDER BY cu.created_at DESC;

-- 4. Check for orphaned records
SELECT cu.*
FROM client_users cu
LEFT JOIN clients c ON cu.client_id = c.id
WHERE c.id IS NULL;
```

### Step 2: Identify the Problem
Based on query results, determine:
- [ ] Does the admin user have a valid client record?
- [ ] Are there any clients in the `clients` table?
- [ ] Is the client_users mapping correct?

## 🛠️ Phase 2: Fix Data Integrity

### Option A: If No Clients Exist
```sql
-- Create a default client for testing
INSERT INTO clients (id, name, type, status)
VALUES (
  gen_random_uuid(),
  'Default Test Company',
  'restaurant',
  'active'
);

-- Get the created client ID and use it below
```

### Option B: If Client Exists But User Not Linked
```sql
-- Link admin user to existing client
-- First, get the client ID from step 1 results
INSERT INTO client_users (user_id, client_id, role, status)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
  'REPLACE_WITH_ACTUAL_CLIENT_ID',
  'admin',
  'active'
);
```

### Option C: If Everything Exists But Wrong Client ID in API
Update the API to use the correct client_id from the database query.

## 🔧 Phase 3: API Fix

### Current Problematic Code (line 188-202)
```typescript
const { data: userClient, error: clientError } = await supabase
  .from('client_users')
  .select('client_id')
  .eq('user_id', user.id)
  .eq('status', 'active')
  .single()

const realClientId = userClient?.client_id || clientId // ❌ Falls back to invalid ID
```

### Fixed Version
```typescript
const { data: userClient, error: clientError } = await supabase
  .from('client_users')
  .select('client_id')
  .eq('user_id', user.id)
  .eq('status', 'active')
  .single()

// ✅ Don't create invitation if no valid client association
if (!userClient?.client_id) {
  console.error('User has no valid client association:', { userId: user.id, clientError })
  return NextResponse.json(
    { error: 'User must be associated with a client to send invitations' },
    { status: 403 }
  )
}

const realClientId = userClient.client_id // ✅ Only use valid client ID
```

## 🧪 Phase 4: Test the Fix

### Step 1: Verify Data Integrity
```sql
-- Confirm the fix worked
SELECT 
  u.email,
  cu.role,
  c.name as client_name,
  cu.status
FROM auth.users u
JOIN client_users cu ON u.id = cu.user_id
JOIN clients c ON cu.client_id = c.id
WHERE u.id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12';
```

### Step 2: Test Invitation Creation
1. Try creating an invitation through the UI
2. Check the API logs for any errors
3. Verify invitation record was created:

```sql
SELECT * FROM invitations 
ORDER BY created_at DESC 
LIMIT 5;
```

## 🚀 Quick Fix Commands

### If You Need a Fast Solution
```sql
-- 1. Create a client if none exists
INSERT INTO clients (id, name, type, status, created_at, updated_at)
VALUES (
  'c1e2d3f4-5678-9abc-def0-123456789012',
  'JiGR Test Company', 
  'restaurant',
  'active',
  now(),
  now()
);

-- 2. Link admin user to this client
INSERT INTO client_users (user_id, client_id, role, status, created_at)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
  'c1e2d3f4-5678-9abc-def0-123456789012',
  'admin',
  'active',
  now()
)
ON CONFLICT (user_id, client_id) DO UPDATE SET
  status = 'active',
  role = 'admin';
```

## ✅ Success Checklist
- [ ] Database audit complete - know what data exists
- [ ] Client-user relationship established
- [ ] API updated to handle missing client associations properly  
- [ ] Invitation creation works without foreign key errors
- [ ] Invitation appears in pending list
- [ ] Email sending works (demo mode)

## 🎯 Expected Timeline
- **Database audit**: 15 minutes
- **Data fix**: 15 minutes  
- **API update**: 30 minutes
- **Testing**: 30 minutes
- **Total**: ~90 minutes

Start with Phase 1 (Database Audit) and let me know what you find!