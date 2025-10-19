-- Add champion_enrolled field to client_users table
-- This separates Champion program enrollment from company roles

-- Add the new column
ALTER TABLE client_users 
ADD COLUMN champion_enrolled BOOLEAN DEFAULT false;

-- Add index for better query performance
CREATE INDEX idx_client_users_champion_enrolled ON client_users(champion_enrolled);

-- Migrate existing CHAMPION role users
UPDATE client_users 
SET champion_enrolled = true, 
    role = 'OWNER'  -- Assuming most CHAMPION users were originally OWNER
WHERE role = 'CHAMPION';

-- Add comment for documentation
COMMENT ON COLUMN client_users.champion_enrolled IS 'Indicates if user is enrolled in the Champion program';