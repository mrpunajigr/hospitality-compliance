-- Migration: Add business configuration tables
-- Date: 2025-10-19
-- Description: Create tables for business departments and job titles configuration

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- BUSINESS DEPARTMENTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS business_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  icon TEXT DEFAULT '🏢',
  security_level TEXT DEFAULT 'medium' CHECK (security_level IN ('low', 'medium', 'high', 'critical')),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(client_id, name),
  CHECK (name IS NOT NULL AND LENGTH(TRIM(name)) > 0),
  CHECK (color ~ '^#[0-9A-Fa-f]{6}$')
);

-- Create indexes for business_departments
CREATE INDEX IF NOT EXISTS idx_business_departments_client_id ON business_departments(client_id);
CREATE INDEX IF NOT EXISTS idx_business_departments_active ON business_departments(client_id, is_active);
CREATE INDEX IF NOT EXISTS idx_business_departments_sort ON business_departments(client_id, sort_order);

-- =============================================================================
-- BUSINESS JOB TITLES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS business_job_titles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  default_role TEXT DEFAULT 'STAFF' CHECK (default_role IN ('STAFF', 'SUPERVISOR', 'MANAGER', 'OWNER')),
  hierarchy_level INTEGER DEFAULT 1 CHECK (hierarchy_level BETWEEN 1 AND 4),
  security_clearance TEXT DEFAULT 'standard' CHECK (security_clearance IN ('basic', 'standard', 'elevated', 'admin')),
  permission_template JSONB DEFAULT '{}',
  primary_department_id UUID REFERENCES business_departments(id) ON DELETE SET NULL,
  reports_to_title_id UUID REFERENCES business_job_titles(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(client_id, title),
  CHECK (title IS NOT NULL AND LENGTH(TRIM(title)) > 0),
  CHECK (reports_to_title_id != id) -- Prevent self-reference
);

-- Create indexes for business_job_titles
CREATE INDEX IF NOT EXISTS idx_business_job_titles_client_id ON business_job_titles(client_id);
CREATE INDEX IF NOT EXISTS idx_business_job_titles_active ON business_job_titles(client_id, is_active);
CREATE INDEX IF NOT EXISTS idx_business_job_titles_department ON business_job_titles(primary_department_id);
CREATE INDEX IF NOT EXISTS idx_business_job_titles_hierarchy ON business_job_titles(client_id, hierarchy_level);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS for both tables
ALTER TABLE business_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_job_titles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for business_departments
CREATE POLICY "Users can view departments for their client" ON business_departments
  FOR SELECT USING (
    client_id IN (
      SELECT client_id FROM client_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Managers can insert departments for their client" ON business_departments
  FOR INSERT WITH CHECK (
    client_id IN (
      SELECT client_id FROM client_users 
      WHERE user_id = auth.uid() 
      AND role IN ('MANAGER', 'OWNER', 'CHAMPION')
    )
  );

CREATE POLICY "Managers can update departments for their client" ON business_departments
  FOR UPDATE USING (
    client_id IN (
      SELECT client_id FROM client_users 
      WHERE user_id = auth.uid() 
      AND role IN ('MANAGER', 'OWNER', 'CHAMPION')
    )
  );

CREATE POLICY "Owners can delete departments for their client" ON business_departments
  FOR DELETE USING (
    client_id IN (
      SELECT client_id FROM client_users 
      WHERE user_id = auth.uid() 
      AND role IN ('OWNER', 'CHAMPION')
    )
  );

-- RLS Policies for business_job_titles
CREATE POLICY "Users can view job titles for their client" ON business_job_titles
  FOR SELECT USING (
    client_id IN (
      SELECT client_id FROM client_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Managers can insert job titles for their client" ON business_job_titles
  FOR INSERT WITH CHECK (
    client_id IN (
      SELECT client_id FROM client_users 
      WHERE user_id = auth.uid() 
      AND role IN ('MANAGER', 'OWNER', 'CHAMPION')
    )
  );

CREATE POLICY "Managers can update job titles for their client" ON business_job_titles
  FOR UPDATE USING (
    client_id IN (
      SELECT client_id FROM client_users 
      WHERE user_id = auth.uid() 
      AND role IN ('MANAGER', 'OWNER', 'CHAMPION')
    )
  );

CREATE POLICY "Owners can delete job titles for their client" ON business_job_titles
  FOR DELETE USING (
    client_id IN (
      SELECT client_id FROM client_users 
      WHERE user_id = auth.uid() 
      AND role IN ('OWNER', 'CHAMPION')
    )
  );

-- =============================================================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================================================

-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_business_departments_updated_at 
  BEFORE UPDATE ON business_departments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_job_titles_updated_at 
  BEFORE UPDATE ON business_job_titles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- SEED DATA (Optional - Common business departments and job titles)
-- =============================================================================

-- Note: This will be populated when clients first access the configuration
-- We'll add common hospitality industry defaults in the application logic