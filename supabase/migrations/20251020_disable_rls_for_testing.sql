-- Temporarily disable RLS for testing the configuration system
-- Date: 2025-10-20
-- Description: Disable RLS on client_display_configurations to test functionality

-- Temporarily disable RLS for testing
ALTER TABLE client_display_configurations DISABLE ROW LEVEL SECURITY;

-- We can re-enable it later once we confirm the system works
-- ALTER TABLE client_display_configurations ENABLE ROW LEVEL SECURITY;