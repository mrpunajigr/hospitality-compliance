-- Add owner_name to clients table and position to profiles table
-- Migration for enhanced account creation fields

-- Add owner_name column to clients table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clients' AND column_name = 'owner_name'
    ) THEN
        ALTER TABLE clients ADD COLUMN owner_name TEXT;
    END IF;
END $$;

-- Add position column to profiles table if it doesn't exist  
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'position'
    ) THEN
        ALTER TABLE profiles ADD COLUMN position TEXT;
    END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN clients.owner_name IS 'Full name of the business owner';
COMMENT ON COLUMN profiles.position IS 'User position/role within the company (e.g., Manager, Owner, Head Chef)';