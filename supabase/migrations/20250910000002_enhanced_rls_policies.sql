-- Enhanced RLS Policies for RBAC Strategy Implementation
-- This migration updates RLS policies to support the new role hierarchy
-- Date: 2025-09-10

-- =====================================================
-- DROP EXISTING POLICIES FOR RECREATION
-- =====================================================

-- Organizations table policies (for clients table)
DROP POLICY IF EXISTS "Users can view their clients" ON clients;
DROP POLICY IF EXISTS "Owners/admins can update client" ON clients;

-- Client users policies
DROP POLICY IF EXISTS "Users can view their client relationships" ON client_users;
DROP POLICY IF EXISTS "Admins can manage client users" ON client_users;

-- Document access policies
DROP POLICY IF EXISTS "Users can view client delivery records" ON delivery_records;
DROP POLICY IF EXISTS "Users can create delivery records" ON delivery_records;
DROP POLICY IF EXISTS "Users can update own delivery records" ON delivery_records;

-- Temperature readings policies
DROP POLICY IF EXISTS "Users can view client temperature readings" ON temperature_readings;

-- Compliance alerts policies
DROP POLICY IF EXISTS "Users can view client compliance alerts" ON compliance_alerts;
DROP POLICY IF EXISTS "Managers can acknowledge alerts" ON compliance_alerts;

-- Other management policies
DROP POLICY IF EXISTS "Managers can manage suppliers" ON suppliers;
DROP POLICY IF EXISTS "Admins can manage invitations" ON invitations;
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Admins can manage settings" ON compliance_settings;

-- =====================================================
-- ORGANIZATIONS TABLE POLICIES (CLIENTS)
-- =====================================================

-- Users can view organizations they belong to
CREATE POLICY "Users can view their organizations" ON clients
    FOR SELECT USING (
        id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Only OWNERS can update organization details
CREATE POLICY "Owners can update organization" ON clients
    FOR UPDATE USING (
        id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() 
            AND role = 'OWNER'
            AND status = 'active'
        )
    );

-- =====================================================
-- CLIENT_USERS TABLE POLICIES (RBAC CORE)
-- =====================================================

-- Users can view team members in their organization
CREATE POLICY "Users can view organization team" ON client_users
    FOR SELECT USING (
        client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- OWNERS and MANAGERS can manage team members
CREATE POLICY "Managers can manage team members" ON client_users
    FOR ALL USING (
        client_id IN (
            SELECT cu.client_id FROM client_users cu
            WHERE cu.user_id = auth.uid() 
            AND cu.role IN ('OWNER', 'MANAGER')
            AND cu.status = 'active'
        )
    );

-- Additional constraint: MANAGERS cannot manage OWNERS or other MANAGERS
CREATE POLICY "Manager role restrictions" ON client_users
    FOR UPDATE USING (
        -- OWNERs can manage everyone
        (EXISTS (
            SELECT 1 FROM client_users cu
            WHERE cu.user_id = auth.uid() 
            AND cu.client_id = client_users.client_id
            AND cu.role = 'OWNER'
            AND cu.status = 'active'
        ))
        OR
        -- MANAGERs can only manage STAFF and SUPERVISOR roles
        (EXISTS (
            SELECT 1 FROM client_users cu
            WHERE cu.user_id = auth.uid() 
            AND cu.client_id = client_users.client_id
            AND cu.role = 'MANAGER'
            AND cu.status = 'active'
        ) AND role IN ('STAFF', 'SUPERVISOR'))
    );

-- =====================================================
-- INVITATIONS TABLE POLICIES
-- =====================================================

-- OWNERS and MANAGERS can manage invitations
CREATE POLICY "Managers can manage invitations" ON invitations
    FOR ALL USING (
        client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() 
            AND role IN ('OWNER', 'MANAGER')
            AND status = 'active'
        )
    );

-- Additional constraint: MANAGERS cannot invite OWNERS or MANAGERS
CREATE POLICY "Manager invitation restrictions" ON invitations
    FOR INSERT WITH CHECK (
        -- OWNERs can invite anyone
        (EXISTS (
            SELECT 1 FROM client_users cu
            WHERE cu.user_id = auth.uid() 
            AND cu.client_id = invitations.client_id
            AND cu.role = 'OWNER'
            AND cu.status = 'active'
        ))
        OR
        -- MANAGERs can only invite STAFF and SUPERVISOR
        (EXISTS (
            SELECT 1 FROM client_users cu
            WHERE cu.user_id = auth.uid() 
            AND cu.client_id = invitations.client_id
            AND cu.role = 'MANAGER'
            AND cu.status = 'active'
        ) AND role IN ('STAFF', 'SUPERVISOR'))
    );

-- =====================================================
-- DOCUMENT ACCESS POLICIES (ROLE-BASED)
-- =====================================================

-- OWNERS and MANAGERS can view all organization documents
CREATE POLICY "Managers can view all documents" ON delivery_records
    FOR SELECT USING (
        client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() 
            AND role IN ('OWNER', 'MANAGER')
            AND status = 'active'
        )
    );

-- SUPERVISORS and STAFF can only view their own documents
CREATE POLICY "Staff can view own documents" ON delivery_records
    FOR SELECT USING (
        user_id = auth.uid() AND
        client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() 
            AND role IN ('SUPERVISOR', 'STAFF')
            AND status = 'active'
        )
    );

-- All active users can create documents for their organization
CREATE POLICY "Users can create documents" ON delivery_records
    FOR INSERT WITH CHECK (
        client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() AND status = 'active'
        ) AND user_id = auth.uid()
    );

-- Users can update their own documents, MANAGERS can update any
CREATE POLICY "Users can update own documents" ON delivery_records
    FOR UPDATE USING (
        (user_id = auth.uid()) OR
        (client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() 
            AND role IN ('OWNER', 'MANAGER')
            AND status = 'active'
        ))
    );

-- =====================================================
-- TEMPERATURE READINGS POLICIES
-- =====================================================

-- OWNERS/MANAGERS see all readings, SUPERVISORS/STAFF see only their own
CREATE POLICY "Role-based temperature readings access" ON temperature_readings
    FOR SELECT USING (
        delivery_record_id IN (
            SELECT dr.id FROM delivery_records dr
            JOIN client_users cu ON dr.client_id = cu.client_id
            WHERE cu.user_id = auth.uid() AND cu.status = 'active'
            AND (
                -- OWNERS and MANAGERS see all
                cu.role IN ('OWNER', 'MANAGER') OR
                -- SUPERVISORS and STAFF see only their own documents
                (cu.role IN ('SUPERVISOR', 'STAFF') AND dr.user_id = auth.uid())
            )
        )
    );

-- =====================================================
-- COMPLIANCE ALERTS POLICIES
-- =====================================================

-- Role-based compliance alerts viewing
CREATE POLICY "Role-based compliance alerts access" ON compliance_alerts
    FOR SELECT USING (
        client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() AND status = 'active'
            AND (
                -- OWNERS and MANAGERS see all alerts
                role IN ('OWNER', 'MANAGER') OR
                -- SUPERVISORS see alerts for their documents
                (role = 'SUPERVISOR' AND delivery_record_id IN (
                    SELECT id FROM delivery_records 
                    WHERE user_id = auth.uid()
                ))
            )
        )
    );

-- OWNERS, MANAGERS, and SUPERVISORS can acknowledge alerts
CREATE POLICY "Supervisors can acknowledge alerts" ON compliance_alerts
    FOR UPDATE USING (
        client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() 
            AND role IN ('OWNER', 'MANAGER', 'SUPERVISOR')
            AND status = 'active'
        )
    );

-- =====================================================
-- SUPPLIERS TABLE POLICIES
-- =====================================================

-- All users can view suppliers for their organization
CREATE POLICY "Users can view organization suppliers" ON suppliers
    FOR SELECT USING (
        client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- OWNERS and MANAGERS can manage suppliers
CREATE POLICY "Managers can manage suppliers" ON suppliers
    FOR ALL USING (
        client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() 
            AND role IN ('OWNER', 'MANAGER')
            AND status = 'active'
        )
    );

-- =====================================================
-- REPORTS AND ANALYTICS POLICIES
-- =====================================================

-- OWNERS and MANAGERS can view and generate reports
CREATE POLICY "Managers can access reports" ON compliance_reports
    FOR ALL USING (
        client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() 
            AND role IN ('OWNER', 'MANAGER')
            AND status = 'active'
        )
    );

-- =====================================================
-- AUDIT LOGS POLICIES
-- =====================================================

-- OWNERS can view all audit logs, MANAGERS can view operational logs
CREATE POLICY "Role-based audit log access" ON audit_logs
    FOR SELECT USING (
        client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() 
            AND role IN ('OWNER', 'MANAGER')
            AND status = 'active'
        ) AND (
            -- OWNERs see everything
            EXISTS (
                SELECT 1 FROM client_users cu
                WHERE cu.user_id = auth.uid() 
                AND cu.client_id = audit_logs.client_id
                AND cu.role = 'OWNER'
                AND cu.status = 'active'
            ) OR
            -- MANAGERs see non-sensitive actions
            (action NOT IN ('billing_updated', 'organization_deleted', 'data_exported', 'user_role_changed_to_owner'))
        )
    );

-- =====================================================
-- BILLING AND SENSITIVE DATA POLICIES
-- =====================================================

-- Only OWNERS can access billing data
CREATE POLICY "Owners only billing access" ON document_usage
    FOR SELECT USING (
        client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() 
            AND role = 'OWNER'
            AND status = 'active'
        )
    );

-- Only OWNERS can access data exports
CREATE POLICY "Owners only data exports" ON data_exports
    FOR ALL USING (
        client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() 
            AND role = 'OWNER'
            AND status = 'active'
        )
    );

-- =====================================================
-- COMPLIANCE SETTINGS POLICIES
-- =====================================================

-- OWNERS and MANAGERS can view settings
CREATE POLICY "Managers can view settings" ON compliance_settings
    FOR SELECT USING (
        client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() 
            AND role IN ('OWNER', 'MANAGER')
            AND status = 'active'
        )
    );

-- Only OWNERS can modify critical settings
CREATE POLICY "Owners can modify settings" ON compliance_settings
    FOR UPDATE USING (
        client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() 
            AND role = 'OWNER'
            AND status = 'active'
        )
    );

-- =====================================================
-- STORAGE POLICIES UPDATE
-- =====================================================

-- Update storage policy for role-based access
DROP POLICY IF EXISTS "Multi-tenant delivery docket access" ON storage.objects;

CREATE POLICY "Role-based delivery docket access" ON storage.objects
    FOR ALL USING (
        bucket_id = 'delivery-dockets' AND
        (storage.foldername(name))[1] IN (
            SELECT client_id::text FROM client_users 
            WHERE user_id = auth.uid() AND status = 'active'
        ) AND (
            -- OWNERS and MANAGERS can access all files
            EXISTS (
                SELECT 1 FROM client_users cu
                WHERE cu.user_id = auth.uid() 
                AND cu.client_id::text = (storage.foldername(name))[1]
                AND cu.role IN ('OWNER', 'MANAGER')
                AND cu.status = 'active'
            ) OR
            -- SUPERVISORS and STAFF can only access their own files
            (storage.foldername(name))[2] = auth.uid()::text
        )
    );

-- =====================================================
-- HELPER FUNCTIONS FOR RLS
-- =====================================================

-- Function to check if user can manage another user
CREATE OR REPLACE FUNCTION can_manage_user(manager_id UUID, target_client_id UUID, target_role TEXT)
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM client_users cu
        WHERE cu.user_id = manager_id 
        AND cu.client_id = target_client_id
        AND cu.status = 'active'
        AND (
            -- OWNERs can manage everyone
            cu.role = 'OWNER' OR
            -- MANAGERs can manage STAFF and SUPERVISOR only
            (cu.role = 'MANAGER' AND target_role IN ('STAFF', 'SUPERVISOR'))
        )
    );
$$;

-- Function to get user's maximum accessible role level
CREATE OR REPLACE FUNCTION user_max_role_level(user_uuid UUID, target_client_id UUID)
RETURNS INTEGER
LANGUAGE sql SECURITY DEFINER
AS $$
    SELECT COALESCE(get_role_level(cu.role), 0)
    FROM client_users cu
    WHERE cu.user_id = user_uuid 
    AND cu.client_id = target_client_id
    AND cu.status = 'active'
    LIMIT 1;
$$;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON POLICY "Role-based temperature readings access" ON temperature_readings IS 
'OWNERS/MANAGERS see all readings, SUPERVISORS/STAFF see only their own documents';

COMMENT ON POLICY "Manager role restrictions" ON client_users IS 
'MANAGERs cannot modify OWNER or MANAGER users, only STAFF and SUPERVISOR';

COMMENT ON POLICY "Role-based compliance alerts access" ON compliance_alerts IS 
'OWNERS/MANAGERS see all alerts, SUPERVISORS see alerts for their documents only';

COMMENT ON FUNCTION can_manage_user(UUID, UUID, TEXT) IS 
'Checks if user has permission to manage another user based on role hierarchy';