-- Add logo_url field to clients table for company branding
-- Migration: 20250101000003_add_client_logo

-- Add logo_url column to clients table
ALTER TABLE clients 
ADD COLUMN logo_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN clients.logo_url IS 'URL to company logo image stored in Supabase storage';

-- Update the updated_at timestamp when logo_url is modified
-- (This will work with existing trigger if one exists, or can be added later)

-- Sample data update (optional) - You can remove this if you prefer clean slate
-- UPDATE clients SET logo_url = null WHERE logo_url IS NULL;