-- Fix Company Creation RLS Policies for Registration Flow
-- Allows service role to create companies and link users during registration

-- Allow service role to create companies during registration
CREATE POLICY "Service role can create companies" ON clients
    FOR INSERT WITH CHECK (true);

-- Allow service role to create client_users relationships during registration  
CREATE POLICY "Service role can create client_users" ON client_users
    FOR INSERT WITH CHECK (true);

-- Allow service role to manage compliance settings during company setup
CREATE POLICY "Service role can create compliance_settings" ON compliance_settings
    FOR INSERT WITH CHECK (true);

-- Allow users to update their own client company details (for company profile management)
CREATE POLICY "Company owners can update client details" ON clients
    FOR UPDATE USING (
        id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin') 
            AND status = 'active'
        )
    );

-- Allow company admins to manage client_users (for staff management)
CREATE POLICY "Company admins can manage team" ON client_users
    FOR ALL USING (
        client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin') 
            AND status = 'active'
        )
    );

-- Allow viewing client_users for company members (needed for team display)
CREATE POLICY "Company members can view team" ON client_users
    FOR SELECT USING (
        client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() 
            AND status = 'active'
        )
    );