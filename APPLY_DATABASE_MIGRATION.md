# Database Migration - Fix Invitation Schema

## The Issue
Your invitation API is failing with foreign key constraint violations because the database is missing the `department` and `job_title` columns that the code expects.

## Solution: Apply This SQL Migration

Go to your Supabase dashboard → SQL Editor and run this SQL:

```sql
-- Add missing department and job_title columns to invitations table
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS job_title TEXT;

-- Add helpful indexes for these new fields  
CREATE INDEX IF NOT EXISTS idx_invitations_department ON invitations(department);
CREATE INDEX IF NOT EXISTS idx_invitations_job_title ON invitations(job_title);
```

## After Running the SQL

1. The foreign key constraint errors should be resolved
2. Try creating an invitation again through the UI
3. The invitation should create successfully and appear in the pending invitations list

## Verification Query

After applying the migration, you can verify the columns were added:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'invitations' 
ORDER BY ordinal_position;
```

You should see `department` and `job_title` in the results.