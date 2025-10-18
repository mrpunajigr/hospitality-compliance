-- =============================================
-- Business Configuration Schema
-- For Departments and Job Titles Management
-- =============================================

-- Table: business_departments
-- Stores department configuration for each client
CREATE TABLE IF NOT EXISTS business_departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Department Information
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6', -- Hex color for UI display
  icon TEXT DEFAULT '🏢', -- Emoji or icon identifier
  
  -- Security Configuration
  security_level TEXT DEFAULT 'internal' CHECK (security_level IN ('public', 'internal', 'restricted', 'confidential')),
  access_requirements JSONB DEFAULT '{}', -- Additional access requirements
  
  -- Organization
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false, -- System default departments
  
  -- Audit Fields
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(client_id, name),
  CONSTRAINT valid_color CHECK (color ~ '^#[0-9A-Fa-f]{6}$')
);

-- Table: business_job_titles
-- Stores job title configuration with role mapping
CREATE TABLE IF NOT EXISTS business_job_titles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Job Title Information
  title TEXT NOT NULL,
  description TEXT,
  
  -- Role and Hierarchy
  default_role TEXT NOT NULL DEFAULT 'STAFF' CHECK (default_role IN ('STAFF', 'SUPERVISOR', 'MANAGER', 'OWNER')),
  hierarchy_level INTEGER DEFAULT 1, -- 1=lowest, 4=highest (OWNER)
  reports_to_title_id UUID REFERENCES business_job_titles(id), -- Reporting hierarchy
  
  -- Security Configuration
  security_clearance TEXT DEFAULT 'standard' CHECK (security_clearance IN ('basic', 'standard', 'elevated', 'admin')),
  permission_template JSONB DEFAULT '{}', -- Custom permissions for this title
  
  -- Department Association (optional)
  primary_department_id UUID REFERENCES business_departments(id),
  
  -- Organization
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false, -- System default job titles
  
  -- Audit Fields
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(client_id, title),
  CONSTRAINT valid_hierarchy_level CHECK (hierarchy_level BETWEEN 1 AND 4),
  CONSTRAINT no_self_reporting CHECK (id != reports_to_title_id)
);

-- Table: business_config_audit
-- Immutable audit trail for configuration changes
CREATE TABLE IF NOT EXISTS business_config_audit (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Change Information
  table_name TEXT NOT NULL, -- 'business_departments' or 'business_job_titles'
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'ACTIVATE', 'DEACTIVATE')),
  
  -- Change Details
  old_values JSONB,
  new_values JSONB,
  changed_fields TEXT[], -- Array of field names that changed
  
  -- Security Context
  changed_by UUID NOT NULL REFERENCES auth.users(id),
  user_role TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  
  -- Risk Assessment
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  requires_approval BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Departments indexes
CREATE INDEX IF NOT EXISTS idx_business_departments_client_id ON business_departments(client_id);
CREATE INDEX IF NOT EXISTS idx_business_departments_active ON business_departments(client_id, is_active);
CREATE INDEX IF NOT EXISTS idx_business_departments_sort ON business_departments(client_id, sort_order, name);
CREATE INDEX IF NOT EXISTS idx_business_departments_security ON business_departments(client_id, security_level);

-- Job titles indexes
CREATE INDEX IF NOT EXISTS idx_business_job_titles_client_id ON business_job_titles(client_id);
CREATE INDEX IF NOT EXISTS idx_business_job_titles_active ON business_job_titles(client_id, is_active);
CREATE INDEX IF NOT EXISTS idx_business_job_titles_role ON business_job_titles(client_id, default_role);
CREATE INDEX IF NOT EXISTS idx_business_job_titles_hierarchy ON business_job_titles(client_id, hierarchy_level);
CREATE INDEX IF NOT EXISTS idx_business_job_titles_department ON business_job_titles(primary_department_id);

-- Audit indexes
CREATE INDEX IF NOT EXISTS idx_business_config_audit_client ON business_config_audit(client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_business_config_audit_record ON business_config_audit(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_business_config_audit_user ON business_config_audit(changed_by, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_business_config_audit_risk ON business_config_audit(client_id, risk_level, created_at DESC);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE business_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_job_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_config_audit ENABLE ROW LEVEL SECURITY;

-- Departments RLS Policies
CREATE POLICY "Users can view own client departments" ON business_departments
  FOR SELECT USING (
    client_id IN (
      SELECT client_id FROM client_users 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );

CREATE POLICY "Managers can insert departments" ON business_departments
  FOR INSERT WITH CHECK (
    client_id IN (
      SELECT client_id FROM client_users 
      WHERE user_id = auth.uid() 
      AND role IN ('MANAGER', 'OWNER')
      AND status = 'active'
    )
  );

CREATE POLICY "Managers can update departments" ON business_departments
  FOR UPDATE USING (
    client_id IN (
      SELECT client_id FROM client_users 
      WHERE user_id = auth.uid() 
      AND role IN ('MANAGER', 'OWNER')
      AND status = 'active'
    )
  );

CREATE POLICY "Owners can delete departments" ON business_departments
  FOR DELETE USING (
    client_id IN (
      SELECT client_id FROM client_users 
      WHERE user_id = auth.uid() 
      AND role = 'OWNER'
      AND status = 'active'
    )
  );

-- Job Titles RLS Policies (similar structure)
CREATE POLICY "Users can view own client job titles" ON business_job_titles
  FOR SELECT USING (
    client_id IN (
      SELECT client_id FROM client_users 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );

CREATE POLICY "Managers can insert job titles" ON business_job_titles
  FOR INSERT WITH CHECK (
    client_id IN (
      SELECT client_id FROM client_users 
      WHERE user_id = auth.uid() 
      AND role IN ('MANAGER', 'OWNER')
      AND status = 'active'
    )
  );

CREATE POLICY "Managers can update job titles" ON business_job_titles
  FOR UPDATE USING (
    client_id IN (
      SELECT client_id FROM client_users 
      WHERE user_id = auth.uid() 
      AND role IN ('MANAGER', 'OWNER')
      AND status = 'active'
    )
  );

CREATE POLICY "Owners can delete job titles" ON business_job_titles
  FOR DELETE USING (
    client_id IN (
      SELECT client_id FROM client_users 
      WHERE user_id = auth.uid() 
      AND role = 'OWNER'
      AND status = 'active'
    )
  );

-- Audit RLS Policies
CREATE POLICY "Users can view own client audit logs" ON business_config_audit
  FOR SELECT USING (
    client_id IN (
      SELECT client_id FROM client_users 
      WHERE user_id = auth.uid() 
      AND role IN ('MANAGER', 'OWNER')
      AND status = 'active'
    )
  );

-- =============================================
-- DEFAULT DATA SEEDING
-- =============================================

-- Function to seed default departments for a client
CREATE OR REPLACE FUNCTION seed_default_departments(p_client_id UUID, p_created_by UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO business_departments (client_id, name, description, color, icon, security_level, sort_order, is_default, created_by)
  VALUES 
    (p_client_id, 'Kitchen', 'Food preparation and cooking area', '#EF4444', '🍳', 'restricted', 1, true, p_created_by),
    (p_client_id, 'Front of House', 'Customer service and dining area', '#3B82F6', '🍽️', 'internal', 2, true, p_created_by),
    (p_client_id, 'Bar', 'Beverage preparation and service', '#8B5CF6', '🍺', 'internal', 3, true, p_created_by),
    (p_client_id, 'Office', 'Administrative and management area', '#10B981', '💼', 'confidential', 4, true, p_created_by),
    (p_client_id, 'Housekeeping', 'Cleaning and maintenance', '#F59E0B', '🧹', 'internal', 5, true, p_created_by),
    (p_client_id, 'Maintenance', 'Technical and facility maintenance', '#6B7280', '🔧', 'restricted', 6, true, p_created_by)
  ON CONFLICT (client_id, name) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Function to seed default job titles for a client
CREATE OR REPLACE FUNCTION seed_default_job_titles(p_client_id UUID, p_created_by UUID)
RETURNS VOID AS $$
DECLARE
  kitchen_dept_id UUID;
  foh_dept_id UUID;
  bar_dept_id UUID;
  office_dept_id UUID;
BEGIN
  -- Get department IDs
  SELECT id INTO kitchen_dept_id FROM business_departments WHERE client_id = p_client_id AND name = 'Kitchen';
  SELECT id INTO foh_dept_id FROM business_departments WHERE client_id = p_client_id AND name = 'Front of House';
  SELECT id INTO bar_dept_id FROM business_departments WHERE client_id = p_client_id AND name = 'Bar';
  SELECT id INTO office_dept_id FROM business_departments WHERE client_id = p_client_id AND name = 'Office';

  INSERT INTO business_job_titles (client_id, title, description, default_role, hierarchy_level, security_clearance, primary_department_id, sort_order, is_default, created_by)
  VALUES 
    (p_client_id, 'Owner', 'Business owner with full access', 'OWNER', 4, 'admin', office_dept_id, 1, true, p_created_by),
    (p_client_id, 'Manager', 'Department or shift manager', 'MANAGER', 3, 'elevated', office_dept_id, 2, true, p_created_by),
    (p_client_id, 'Supervisor', 'Team leader and supervisor', 'SUPERVISOR', 2, 'standard', NULL, 3, true, p_created_by),
    (p_client_id, 'Head Chef', 'Kitchen manager and head chef', 'MANAGER', 3, 'elevated', kitchen_dept_id, 4, true, p_created_by),
    (p_client_id, 'Line Cook', 'Kitchen preparation and cooking', 'STAFF', 1, 'standard', kitchen_dept_id, 5, true, p_created_by),
    (p_client_id, 'Server', 'Customer service and table service', 'STAFF', 1, 'standard', foh_dept_id, 6, true, p_created_by),
    (p_client_id, 'Bartender', 'Beverage preparation and service', 'STAFF', 1, 'standard', bar_dept_id, 7, true, p_created_by),
    (p_client_id, 'Host/Hostess', 'Customer greeting and seating', 'STAFF', 1, 'basic', foh_dept_id, 8, true, p_created_by),
    (p_client_id, 'Cleaner', 'Cleaning and sanitation', 'STAFF', 1, 'basic', NULL, 9, true, p_created_by)
  ON CONFLICT (client_id, title) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRIGGERS FOR AUDIT LOGGING
-- =============================================

-- Function to log configuration changes
CREATE OR REPLACE FUNCTION log_config_change()
RETURNS TRIGGER AS $$
DECLARE
  current_user_id UUID;
  current_user_role TEXT;
  risk_assessment TEXT;
BEGIN
  -- Get current user context
  current_user_id := auth.uid();
  
  -- Get user role for the client
  SELECT role INTO current_user_role 
  FROM client_users 
  WHERE user_id = current_user_id 
  AND client_id = COALESCE(NEW.client_id, OLD.client_id)
  AND status = 'active';
  
  -- Assess risk level based on operation and role
  risk_assessment := CASE 
    WHEN TG_OP = 'DELETE' THEN 'high'
    WHEN TG_OP = 'UPDATE' AND current_user_role = 'OWNER' THEN 'medium'
    WHEN TG_OP = 'UPDATE' THEN 'high'
    ELSE 'low'
  END;
  
  -- Insert audit record
  INSERT INTO business_config_audit (
    client_id,
    table_name,
    record_id,
    action,
    old_values,
    new_values,
    changed_by,
    user_role,
    risk_level
  ) VALUES (
    COALESCE(NEW.client_id, OLD.client_id),
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP != 'INSERT' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END,
    current_user_id,
    COALESCE(current_user_role, 'UNKNOWN'),
    risk_assessment
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for audit logging
CREATE TRIGGER business_departments_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON business_departments
  FOR EACH ROW EXECUTE FUNCTION log_config_change();

CREATE TRIGGER business_job_titles_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON business_job_titles
  FOR EACH ROW EXECUTE FUNCTION log_config_change();

-- =============================================
-- UTILITY FUNCTIONS
-- =============================================

-- Function to initialize business configuration for new clients
CREATE OR REPLACE FUNCTION initialize_business_config(p_client_id UUID, p_owner_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Seed default departments
  PERFORM seed_default_departments(p_client_id, p_owner_id);
  
  -- Seed default job titles
  PERFORM seed_default_job_titles(p_client_id, p_owner_id);
  
  -- Log initialization
  INSERT INTO business_config_audit (
    client_id,
    table_name,
    record_id,
    action,
    new_values,
    changed_by,
    user_role,
    risk_level
  ) VALUES (
    p_client_id,
    'business_configuration',
    p_client_id,
    'CREATE',
    '{"action": "initialize_default_config"}',
    p_owner_id,
    'OWNER',
    'low'
  );
END;
$$ LANGUAGE plpgsql;