-- Add missing department and job_title columns to invitations table
-- These columns are expected by the GET API but don't exist in the current schema

ALTER TABLE invitations ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS job_title TEXT;

-- Add helpful indexes for these new fields
CREATE INDEX IF NOT EXISTS idx_invitations_department ON invitations(department);
CREATE INDEX IF NOT EXISTS idx_invitations_job_title ON invitations(job_title);

-- Update any existing RLS policies to handle the new columns (they should work automatically)
-- No policy changes needed as these are just optional text fields