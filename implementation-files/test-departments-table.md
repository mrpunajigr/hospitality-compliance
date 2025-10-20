# Test Business Departments Table

## Quick Test Query

Run this in your Supabase SQL Editor to check if the table exists and is properly configured:

```sql
-- Check if business_departments table exists
SELECT table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'business_departments'
ORDER BY ordinal_position;

-- Check if there are any existing departments
SELECT COUNT(*) as department_count FROM business_departments;

-- Check table constraints
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'business_departments';
```

## Expected Results

If the table exists properly, you should see:
- Columns: id, client_id, name, description, color, icon, security_level, etc.
- At least one constraint (PRIMARY KEY)
- Row Level Security enabled

## If Table Doesn't Exist

Run the migration again:
```bash
npx supabase db push
```

## Alternative: Manual Table Creation

If the migration didn't work, run this SQL manually:

```sql
CREATE TABLE IF NOT EXISTS business_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  icon TEXT DEFAULT '🏢',
  security_level TEXT DEFAULT 'medium' CHECK (security_level IN ('low', 'medium', 'high', 'critical')),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(client_id, name),
  CHECK (name IS NOT NULL AND LENGTH(TRIM(name)) > 0),
  CHECK (color ~ '^#[0-9A-Fa-f]{6}$')
);

ALTER TABLE business_departments ENABLE ROW LEVEL SECURITY;
```