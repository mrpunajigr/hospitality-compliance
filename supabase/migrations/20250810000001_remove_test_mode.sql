-- Remove TEST mode functionality - simplify for development phase
-- Drop test_mode and test_session_id columns from delivery_records table

BEGIN;

-- Remove test_mode and test_session_id columns
ALTER TABLE delivery_records 
  DROP COLUMN IF EXISTS test_mode,
  DROP COLUMN IF EXISTS test_session_id;

COMMIT;