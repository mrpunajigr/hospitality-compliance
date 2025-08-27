-- Fix RLS policies to allow service role to insert delivery records
-- This will enable the bulk processing API and Edge Function to create records

-- First, check current RLS status
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'delivery_records';

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "delivery_records_insert_policy" ON delivery_records;
DROP POLICY IF EXISTS "delivery_records_select_policy" ON delivery_records;
DROP POLICY IF EXISTS "delivery_records_update_policy" ON delivery_records;
DROP POLICY IF EXISTS "delivery_records_delete_policy" ON delivery_records;

-- Create permissive policies that allow service role to manage records
CREATE POLICY "Enable insert for service role" ON delivery_records
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable select for service role" ON delivery_records 
  FOR SELECT USING (true);

CREATE POLICY "Enable update for service role" ON delivery_records
  FOR UPDATE USING (true) WITH CHECK (true);

-- Grant necessary permissions to service_role
GRANT ALL ON delivery_records TO service_role;
GRANT USAGE ON SEQUENCE delivery_records_id_seq TO service_role;

-- Ensure RLS is enabled but policies allow service role access
ALTER TABLE delivery_records ENABLE ROW LEVEL SECURITY;