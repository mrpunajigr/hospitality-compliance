-- Safe Migration: Fix business configuration tables
-- Date: 2025-10-20
-- Description: Safely create business_departments and business_job_titles tables with proper RLS

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- BUSINESS DEPARTMENTS TABLE (Safe Creation)
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

-- =============================================================================
-- BUSINESS JOB TITLES TABLE (Safe Creation)
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

-- =============================================================================
-- INDEXES (Safe Creation)
-- =============================================================================

-- Business departments indexes
CREATE INDEX IF NOT EXISTS idx_business_departments_client_id ON business_departments(client_id);
CREATE INDEX IF NOT EXISTS idx_business_departments_active ON business_departments(client_id, is_active);
CREATE INDEX IF NOT EXISTS idx_business_departments_sort ON business_departments(client_id, sort_order);

-- Business job titles indexes
CREATE INDEX IF NOT EXISTS idx_business_job_titles_client_id ON business_job_titles(client_id);
CREATE INDEX IF NOT EXISTS idx_business_job_titles_active ON business_job_titles(client_id, is_active);
CREATE INDEX IF NOT EXISTS idx_business_job_titles_department ON business_job_titles(primary_department_id);
CREATE INDEX IF NOT EXISTS idx_business_job_titles_hierarchy ON business_job_titles(client_id, hierarchy_level);

-- =============================================================================
-- ROW LEVEL SECURITY (Safe Enablement)
-- =============================================================================

-- Enable RLS (safe if already enabled)
ALTER TABLE business_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_job_titles ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS POLICIES (Safe Creation with DROP IF EXISTS)
-- =============================================================================

-- Drop existing policies if they exist, then recreate
DROP POLICY IF EXISTS "Users can view departments for their client" ON business_departments;
DROP POLICY IF EXISTS "Managers can insert departments for their client" ON business_departments;
DROP POLICY IF EXISTS "Managers can update departments for their client" ON business_departments;
DROP POLICY IF EXISTS "Owners can delete departments for their client" ON business_departments;

DROP POLICY IF EXISTS "Users can view job titles for their client" ON business_job_titles;
DROP POLICY IF EXISTS "Managers can insert job titles for their client" ON business_job_titles;
DROP POLICY IF EXISTS "Managers can update job titles for their client" ON business_job_titles;
DROP POLICY IF EXISTS "Owners can delete job titles for their client" ON business_job_titles;

-- Create fresh policies
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
-- TRIGGERS (Safe Creation)
-- =============================================================================

-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist, then recreate
DROP TRIGGER IF EXISTS update_business_departments_updated_at ON business_departments;
DROP TRIGGER IF EXISTS update_business_job_titles_updated_at ON business_job_titles;

-- Create fresh triggers
CREATE TRIGGER update_business_departments_updated_at 
  BEFORE UPDATE ON business_departments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_job_titles_updated_at 
  BEFORE UPDATE ON business_job_titles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();