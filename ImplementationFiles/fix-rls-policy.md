# Fix RLS Policy for getUserClient

## The Issue
The regular supabase client is blocked by the RLS SELECT policy on clients table. We need to add a service role policy or fix the existing policy.

## Quick Fix - Add Service Role Policy

Run this in your Supabase SQL Editor:

```sql
-- Add explicit service role SELECT policy
CREATE POLICY "Service role can select clients" 
ON clients 
FOR SELECT 
TO service_role 
USING (true);
```

## Alternative Fix - Update Existing Policy

Or modify the existing SELECT policy to be more permissive:

```sql
-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users can view their organizations" ON clients;

-- Create a more permissive policy
CREATE POLICY "Users can view their organizations" 
ON clients 
FOR SELECT 
TO public 
USING (
  -- Allow if user is associated with this client
  id IN (
    SELECT client_users.client_id
    FROM client_users
    WHERE client_users.user_id = auth.uid() 
    AND client_users.status = 'active'
  )
  -- OR if this is a service role
  OR auth.role() = 'service_role'
);
```

## Nuclear Option - Temporarily Disable RLS

If policies are too complex, temporarily disable RLS:

```sql
-- TEMPORARY - DO NOT LEAVE THIS WAY
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
```

Test the app, then re-enable:

```sql
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
```

## Recommended Approach
1. First, try adding the service role policy
2. If that doesn't work, update the existing policy 
3. Last resort: temporarily disable RLS for testing