# Fix Database Table Issue

## 🔍 Diagnostic: Check Table Structure

Run this in Supabase SQL Editor to see what we have:

```sql
-- Check if table exists and what columns it has
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'client_display_configurations'
ORDER BY ordinal_position;

-- Check all tables with 'display' in the name
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE '%display%';
```

## 🛠️ Fix: Create Correct Table

If the table doesn't exist or has wrong columns, run this:

```sql
-- Drop existing table if it has wrong structure
DROP TABLE IF EXISTS client_display_configurations CASCADE;

-- Create correct table structure
CREATE TABLE client_display_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  configuration_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(client_id)
);

-- Create indexes
CREATE INDEX idx_client_display_configurations_client_id 
ON client_display_configurations(client_id);

CREATE INDEX idx_client_display_configurations_data 
ON client_display_configurations USING GIN (configuration_data);

-- Enable RLS
ALTER TABLE client_display_configurations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their client's display configuration" 
ON client_display_configurations
FOR SELECT USING (
  client_id IN (
    SELECT client_id FROM client_users 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their client's display configuration" 
ON client_display_configurations
FOR ALL USING (
  client_id IN (
    SELECT client_id FROM client_users 
    WHERE user_id = auth.uid()
    AND role IN ('OWNER', 'MANAGER', 'CHAMPION')
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_client_display_configurations_updated_at 
  BEFORE UPDATE ON client_display_configurations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## ✅ Verify Table Created

After running the fix, verify with:

```sql
-- Check table structure
\d client_display_configurations

-- Or use this for web interface:
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'client_display_configurations';
```

You should see:
- `id` (uuid)
- `client_id` (uuid) 
- `configuration_data` (jsonb) ← This is the important one!
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

Once this is fixed, the configuration page should work properly!