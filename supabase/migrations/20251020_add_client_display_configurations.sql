-- Migration: Add client display configurations table
-- Date: 2025-10-20
-- Description: Create table for storing client display field configurations with RLS

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- CLIENT DISPLAY CONFIGURATIONS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS client_display_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  configuration_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(client_id)
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Create index for client lookups
CREATE INDEX IF NOT EXISTS idx_client_display_configurations_client_id 
ON client_display_configurations(client_id);

-- Create index for JSONB configuration data searches
CREATE INDEX IF NOT EXISTS idx_client_display_configurations_data 
ON client_display_configurations USING GIN (configuration_data);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

-- Enable RLS
ALTER TABLE client_display_configurations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their client's display configuration" ON client_display_configurations;
DROP POLICY IF EXISTS "Users can update their client's display configuration" ON client_display_configurations;

-- RLS Policies
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

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Add trigger for updated_at (reuse existing function)
DROP TRIGGER IF EXISTS update_client_display_configurations_updated_at ON client_display_configurations;

CREATE TRIGGER update_client_display_configurations_updated_at 
  BEFORE UPDATE ON client_display_configurations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();