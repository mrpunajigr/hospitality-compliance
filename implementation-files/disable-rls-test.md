# Disable RLS for Testing

## Step 1: Disable RLS Temporarily

```sql
ALTER TABLE business_departments DISABLE ROW LEVEL SECURITY;
```

## Step 2: Test the Toggle

After running the above SQL, try the department toggle in your browser.

## Expected Results

If RLS was the issue:
- ✅ Toggle should work
- ✅ Departments should be created
- ✅ No more 500 errors

## Step 3: If It Works, Re-enable with Fixed Policies

If the toggle works after disabling RLS, run this to fix the policies:

```sql
-- Re-enable RLS
ALTER TABLE business_departments ENABLE ROW LEVEL SECURITY;

-- Create simple, working policies
CREATE POLICY "Allow all operations for authenticated users" ON business_departments
  FOR ALL USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
```

This creates a permissive policy for testing. We can make it more restrictive later once everything works.