-- Run this in Supabase SQL Editor to create the business_roles table
-- Business Roles Configuration
-- This table stores client-specific role configurations and naming

CREATE TABLE business_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  system_role TEXT NOT NULL CHECK (system_role IN ('STAFF', 'SUPERVISOR', 'MANAGER', 'OWNER')),
  display_name TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique system roles per client
  UNIQUE(client_id, system_role)
);

-- Add RLS policies
ALTER TABLE business_roles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access roles for their own client
CREATE POLICY "business_roles_client_access" ON business_roles
  FOR ALL USING (
    client_id IN (
      SELECT client_id 
      FROM client_users 
      WHERE user_id = auth.uid()
      AND status = 'active'
    )
  );

-- Policy: Only MANAGER and OWNER can modify roles
CREATE POLICY "business_roles_admin_modify" ON business_roles
  FOR ALL USING (
    client_id IN (
      SELECT client_id 
      FROM client_users 
      WHERE user_id = auth.uid()
      AND role IN ('MANAGER', 'OWNER')
      AND status = 'active'
    )
  ) WITH CHECK (
    client_id IN (
      SELECT client_id 
      FROM client_users 
      WHERE user_id = auth.uid()
      AND role IN ('MANAGER', 'OWNER')
      AND status = 'active'
    )
  );

-- Add indexes for performance
CREATE INDEX idx_business_roles_client_id ON business_roles(client_id);
CREATE INDEX idx_business_roles_system_role ON business_roles(system_role);
CREATE INDEX idx_business_roles_sort_order ON business_roles(client_id, sort_order);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_business_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_business_roles_updated_at
  BEFORE UPDATE ON business_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_business_roles_updated_at();

-- Add comment for documentation
COMMENT ON TABLE business_roles IS 'Client-specific role configurations and custom naming for system roles';
COMMENT ON COLUMN business_roles.system_role IS 'The core system role (STAFF, SUPERVISOR, MANAGER, OWNER)';
COMMENT ON COLUMN business_roles.display_name IS 'Business-specific name for the role (e.g., "Team Leader" instead of "Supervisor")';
COMMENT ON COLUMN business_roles.is_enabled IS 'Whether this role is active and available for assignment in this business';
COMMENT ON COLUMN business_roles.sort_order IS 'Display order for role selection interfaces';