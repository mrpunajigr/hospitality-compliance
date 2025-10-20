-- Fix: Create correct client_display_configurations table
-- Date: 2025-10-20
-- Description: Create table with proper configuration_data JSONB column

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