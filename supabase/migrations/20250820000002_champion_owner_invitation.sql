-- =============================================
-- Champion and Owner Invitation System
-- Supports evaluation mode and owner handoff
-- =============================================

-- Add CHAMPION role to existing role checks
ALTER TABLE client_users DROP CONSTRAINT IF EXISTS client_users_role_check;
ALTER TABLE client_users ADD CONSTRAINT client_users_role_check 
  CHECK (role IN ('STAFF', 'SUPERVISOR', 'MANAGER', 'OWNER', 'CHAMPION'));

-- Add evaluation mode fields to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS evaluation_mode BOOLEAN DEFAULT false;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS evaluation_expires_at TIMESTAMPTZ;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS champion_user_id UUID REFERENCES auth.users(id);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS ownership_verified BOOLEAN DEFAULT false;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS business_registration_number TEXT;

-- Create owner_invitations table
CREATE TABLE IF NOT EXISTS owner_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  champion_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Owner Information
  owner_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  relationship TEXT DEFAULT 'Business Owner',
  preferred_contact TEXT DEFAULT 'email' CHECK (preferred_contact IN ('email', 'phone', 'both')),
  
  -- Invitation Details
  invitation_token TEXT NOT NULL UNIQUE,
  evaluation_message TEXT,
  timeline TEXT,
  evaluation_summary JSONB,
  include_roi_data BOOLEAN DEFAULT true,
  
  -- Status Tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'accepted', 'declined', 'expired')),
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  viewed_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  
  -- Owner Response
  owner_feedback TEXT,
  requested_changes JSONB,
  approval_status TEXT CHECK (approval_status IN ('approved', 'changes_requested', 'declined')),
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(client_id, email, status) DEFERRABLE INITIALLY DEFERRED
);

-- Create evaluation_settings table for champion configurations
CREATE TABLE IF NOT EXISTS evaluation_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  champion_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Evaluation Configuration
  settings_type TEXT NOT NULL CHECK (settings_type IN ('department_config', 'job_title_config', 'security_config', 'compliance_config')),
  configuration_data JSONB NOT NULL,
  is_temporary BOOLEAN DEFAULT true,
  
  -- Approval Status
  requires_owner_approval BOOLEAN DEFAULT true,
  approved_by_owner BOOLEAN DEFAULT false,
  owner_approved_at TIMESTAMPTZ,
  owner_approval_notes TEXT,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(client_id, champion_id, settings_type)
);

-- Create evaluation_metrics table for ROI tracking
CREATE TABLE IF NOT EXISTS evaluation_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  champion_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Metrics Data
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('time_saved', 'compliance_score', 'team_engagement', 'feature_usage', 'roi_calculation')),
  metric_value JSONB NOT NULL,
  
  -- Context
  description TEXT,
  measurement_method TEXT,
  
  -- Timestamps
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(client_id, champion_id, metric_date, metric_type)
);

-- Create champion_handoff table for ownership transfer
CREATE TABLE IF NOT EXISTS champion_handoff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  champion_id UUID NOT NULL REFERENCES auth.users(id),
  owner_invitation_id UUID NOT NULL REFERENCES owner_invitations(id),
  
  -- Handoff Process
  handoff_stage TEXT DEFAULT 'initiated' CHECK (handoff_stage IN ('initiated', 'owner_review', 'changes_requested', 'approved', 'completed', 'cancelled')),
  champion_setup_complete BOOLEAN DEFAULT false,
  owner_review_complete BOOLEAN DEFAULT false,
  billing_setup_complete BOOLEAN DEFAULT false,
  
  -- Configuration Snapshots
  pre_handoff_config JSONB, -- Champion's configuration
  post_handoff_config JSONB, -- Final approved configuration
  configuration_changes JSONB, -- What changed during handoff
  
  -- Timeline
  initiated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  owner_review_started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Notes
  champion_notes TEXT,
  owner_notes TEXT,
  handoff_summary TEXT,
  
  UNIQUE(client_id, champion_id)
);

-- Create champion_success_scores table for tracking champion progress
CREATE TABLE IF NOT EXISTS champion_success_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  champion_id UUID NOT NULL REFERENCES auth.users(id),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Success Score Components
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  configuration_quality INTEGER NOT NULL CHECK (configuration_quality >= 0 AND configuration_quality <= 40),
  value_articulation INTEGER NOT NULL CHECK (value_articulation >= 0 AND value_articulation <= 30),
  readiness_indicators INTEGER NOT NULL CHECK (readiness_indicators >= 0 AND readiness_indicators <= 30),
  
  -- Metadata
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(champion_id, client_id)
);

-- Create owner_engagement_events table for detailed tracking
CREATE TABLE IF NOT EXISTS owner_engagement_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invitation_id UUID NOT NULL REFERENCES owner_invitations(id) ON DELETE CASCADE,
  champion_id UUID NOT NULL REFERENCES auth.users(id),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Event Details
  event_type TEXT NOT NULL CHECK (event_type IN ('email_opened', 'link_clicked', 'review_started', 'review_completed', 'response_submitted')),
  event_data JSONB DEFAULT '{}',
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create champion_notifications table for real-time updates
CREATE TABLE IF NOT EXISTS champion_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  champion_id UUID NOT NULL REFERENCES auth.users(id),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Notification Details
  notification_type TEXT NOT NULL CHECK (notification_type IN ('owner_engagement', 'evaluation_reminder', 'system_update', 'achievement_earned')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Owner invitations indexes
CREATE INDEX IF NOT EXISTS idx_owner_invitations_client_id ON owner_invitations(client_id);
CREATE INDEX IF NOT EXISTS idx_owner_invitations_champion_id ON owner_invitations(champion_id);
CREATE INDEX IF NOT EXISTS idx_owner_invitations_status ON owner_invitations(status, expires_at);
CREATE INDEX IF NOT EXISTS idx_owner_invitations_token ON owner_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_owner_invitations_email ON owner_invitations(email);

-- Evaluation settings indexes
CREATE INDEX IF NOT EXISTS idx_evaluation_settings_client_id ON evaluation_settings(client_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_settings_champion ON evaluation_settings(champion_id, settings_type);
CREATE INDEX IF NOT EXISTS idx_evaluation_settings_approval ON evaluation_settings(requires_owner_approval, approved_by_owner);

-- Evaluation metrics indexes
CREATE INDEX IF NOT EXISTS idx_evaluation_metrics_client_id ON evaluation_metrics(client_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_metrics_champion ON evaluation_metrics(champion_id, metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_evaluation_metrics_type ON evaluation_metrics(metric_type, recorded_at DESC);

-- Champion handoff indexes
CREATE INDEX IF NOT EXISTS idx_champion_handoff_client_id ON champion_handoff(client_id);
CREATE INDEX IF NOT EXISTS idx_champion_handoff_stage ON champion_handoff(handoff_stage, initiated_at DESC);

-- Champion success scores indexes
CREATE INDEX IF NOT EXISTS idx_champion_success_scores_champion ON champion_success_scores(champion_id, calculated_at DESC);
CREATE INDEX IF NOT EXISTS idx_champion_success_scores_client ON champion_success_scores(client_id, score DESC);

-- Owner engagement events indexes
CREATE INDEX IF NOT EXISTS idx_owner_engagement_events_invitation ON owner_engagement_events(invitation_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_owner_engagement_events_champion ON owner_engagement_events(champion_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_owner_engagement_events_type ON owner_engagement_events(event_type, timestamp DESC);

-- Champion notifications indexes
CREATE INDEX IF NOT EXISTS idx_champion_notifications_champion ON champion_notifications(champion_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_champion_notifications_unread ON champion_notifications(champion_id, is_read, created_at DESC);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all new tables
ALTER TABLE owner_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE champion_handoff ENABLE ROW LEVEL SECURITY;
ALTER TABLE champion_success_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE owner_engagement_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE champion_notifications ENABLE ROW LEVEL SECURITY;

-- Owner Invitations RLS Policies
CREATE POLICY "Champions can manage own invitations" ON owner_invitations
  FOR ALL USING (
    champion_id = auth.uid() OR
    client_id IN (
      SELECT client_id FROM client_users 
      WHERE user_id = auth.uid() 
      AND role IN ('OWNER', 'CHAMPION')
      AND status = 'active'
    )
  );

CREATE POLICY "Owners can view invitations to their clients" ON owner_invitations
  FOR SELECT USING (
    client_id IN (
      SELECT client_id FROM client_users 
      WHERE user_id = auth.uid() 
      AND role = 'OWNER'
      AND status = 'active'
    )
  );

-- Evaluation Settings RLS Policies
CREATE POLICY "Champions can manage own evaluation settings" ON evaluation_settings
  FOR ALL USING (
    champion_id = auth.uid() OR
    client_id IN (
      SELECT client_id FROM client_users 
      WHERE user_id = auth.uid() 
      AND role IN ('OWNER', 'CHAMPION')
      AND status = 'active'
    )
  );

-- Evaluation Metrics RLS Policies
CREATE POLICY "Champions can manage own metrics" ON evaluation_metrics
  FOR ALL USING (
    champion_id = auth.uid() OR
    client_id IN (
      SELECT client_id FROM client_users 
      WHERE user_id = auth.uid() 
      AND role IN ('OWNER', 'CHAMPION')
      AND status = 'active'
    )
  );

-- Champion Handoff RLS Policies
CREATE POLICY "Champions and owners can view handoff process" ON champion_handoff
  FOR ALL USING (
    champion_id = auth.uid() OR
    client_id IN (
      SELECT client_id FROM client_users 
      WHERE user_id = auth.uid() 
      AND role IN ('OWNER', 'CHAMPION')
      AND status = 'active'
    )
  );

-- Champion Success Scores RLS Policies
CREATE POLICY "Champions can view own success scores" ON champion_success_scores
  FOR ALL USING (
    champion_id = auth.uid() OR
    client_id IN (
      SELECT client_id FROM client_users 
      WHERE user_id = auth.uid() 
      AND role IN ('OWNER', 'CHAMPION')
      AND status = 'active'
    )
  );

-- Owner Engagement Events RLS Policies
CREATE POLICY "Champions can view own engagement events" ON owner_engagement_events
  FOR ALL USING (
    champion_id = auth.uid() OR
    client_id IN (
      SELECT client_id FROM client_users 
      WHERE user_id = auth.uid() 
      AND role IN ('OWNER', 'CHAMPION')
      AND status = 'active'
    )
  );

-- Champion Notifications RLS Policies
CREATE POLICY "Champions can manage own notifications" ON champion_notifications
  FOR ALL USING (
    champion_id = auth.uid()
  );

-- =============================================
-- TRIGGERS AND FUNCTIONS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_owner_invitations_updated_at BEFORE UPDATE ON owner_invitations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evaluation_settings_updated_at BEFORE UPDATE ON evaluation_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle invitation expiry
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS void AS $$
BEGIN
  UPDATE owner_invitations 
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'pending' 
  AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to create evaluation mode client
CREATE OR REPLACE FUNCTION create_evaluation_client(
  p_champion_id UUID,
  p_client_name TEXT,
  p_business_type TEXT DEFAULT 'Restaurant'
)
RETURNS UUID AS $$
DECLARE
  v_client_id UUID;
BEGIN
  -- Create client in evaluation mode
  INSERT INTO clients (
    name,
    business_type,
    evaluation_mode,
    evaluation_expires_at,
    champion_user_id,
    ownership_verified
  ) VALUES (
    p_client_name,
    p_business_type,
    true,
    NOW() + INTERVAL '30 days',
    p_champion_id,
    false
  ) RETURNING id INTO v_client_id;
  
  -- Add champion as CHAMPION role
  INSERT INTO client_users (
    client_id,
    user_id,
    role,
    status,
    invited_at,
    joined_at
  ) VALUES (
    v_client_id,
    p_champion_id,
    'CHAMPION',
    'active',
    NOW(),
    NOW()
  );
  
  -- Initialize business configuration with defaults
  PERFORM initialize_business_config(v_client_id, p_champion_id);
  
  RETURN v_client_id;
END;
$$ LANGUAGE plpgsql;

-- Function to handle ownership transfer
CREATE OR REPLACE FUNCTION transfer_ownership_to_owner(
  p_client_id UUID,
  p_owner_user_id UUID,
  p_champion_id UUID
)
RETURNS boolean AS $$
BEGIN
  -- Update client to remove evaluation mode
  UPDATE clients 
  SET evaluation_mode = false,
      evaluation_expires_at = NULL,
      ownership_verified = true,
      updated_at = NOW()
  WHERE id = p_client_id;
  
  -- Update champion role to MANAGER
  UPDATE client_users 
  SET role = 'MANAGER',
      updated_at = NOW()
  WHERE client_id = p_client_id 
  AND user_id = p_champion_id;
  
  -- Add owner with OWNER role
  INSERT INTO client_users (
    client_id,
    user_id,
    role,
    status,
    invited_at,
    joined_at
  ) VALUES (
    p_client_id,
    p_owner_user_id,
    'OWNER',
    'active',
    NOW(),
    NOW()
  ) ON CONFLICT (client_id, user_id) DO UPDATE SET
    role = 'OWNER',
    status = 'active',
    updated_at = NOW();
  
  -- Create handoff completion record
  UPDATE champion_handoff 
  SET handoff_stage = 'completed',
      completed_at = NOW(),
      owner_review_complete = true,
      billing_setup_complete = true
  WHERE client_id = p_client_id 
  AND champion_id = p_champion_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- INITIAL DATA AND CLEANUP
-- =============================================

-- Clean up expired invitations (run periodically)
-- This could be set up as a cron job or scheduled function
SELECT expire_old_invitations();