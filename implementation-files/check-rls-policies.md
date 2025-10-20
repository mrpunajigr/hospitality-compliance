# Check and Fix RLS Policies

## Check Current RLS Policies

Run this in Supabase SQL Editor to see the current policies:

```sql
-- Check RLS policies for business_departments
SELECT schemaname, tablename, policyname, cmd, roles, qual, with_check
FROM pg_policies 
WHERE tablename = 'business_departments';

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'business_departments';
```

## Temporary Fix: Disable RLS for Testing

Let's temporarily disable RLS to test if the functionality works:

```sql
-- Temporarily disable RLS for testing
ALTER TABLE business_departments DISABLE ROW LEVEL SECURITY;
```

## Test Department Creation

After disabling RLS, try the toggle again. If it works, we know the issue is with the RLS policy.

## Re-enable RLS with Correct Policy

If the toggle works after disabling RLS, run this to re-enable with a working policy:

```sql
-- Re-enable RLS
ALTER TABLE business_departments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view departments for their client" ON business_departments;
DROP POLICY IF EXISTS "Managers can insert departments for their client" ON business_departments;
DROP POLICY IF EXISTS "Managers can update departments for their client" ON business_departments;
DROP POLICY IF EXISTS "Owners can delete departments for their client" ON business_departments;

-- Create working policies
CREATE POLICY "Users can view departments for their client" ON business_departments
  FOR SELECT USING (
    client_id IN (
      SELECT client_id FROM client_users 
      WHERE user_id = auth.uid()
      AND status = 'active'
    )
  );

CREATE POLICY "Managers can insert departments for their client" ON business_departments
  FOR INSERT WITH CHECK (
    client_id IN (
      SELECT client_id FROM client_users 
      WHERE user_id = auth.uid() 
      AND role IN ('MANAGER', 'OWNER', 'CHAMPION')
      AND status = 'active'
    )
  );

CREATE POLICY "Managers can update departments for their client" ON business_departments
  FOR UPDATE USING (
    client_id IN (
      SELECT client_id FROM client_users 
      WHERE user_id = auth.uid() 
      AND role IN ('MANAGER', 'OWNER', 'CHAMPION')
      AND status = 'active'
    )
  );

CREATE POLICY "Owners can delete departments for their client" ON business_departments
  FOR DELETE USING (
    client_id IN (
      SELECT client_id FROM client_users 
      WHERE user_id = auth.uid() 
      AND role IN ('OWNER', 'CHAMPION')
      AND status = 'active'
    )
  );
```

Try the first step (disable RLS) and test the toggle!