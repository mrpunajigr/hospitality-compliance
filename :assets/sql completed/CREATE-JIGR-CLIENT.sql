-- Create JiGR development client record for steve@jigr.app
-- This will fix the authentication issue causing UUID errors

-- First get the user ID for steve@jigr.app
SELECT id, email FROM auth.users WHERE email = 'steve@jigr.app';

-- Create the JiGR development client record
INSERT INTO clients (
  id,
  user_id,
  company_name,
  contact_email,
  status,
  subscription_tier,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM auth.users WHERE email = 'steve@jigr.app'),
  'JiGR development',
  'steve@jigr.app',
  'active',
  'enterprise',
  now(),
  now()
);

-- Verify the client was created
SELECT id, user_id, company_name, contact_email, status FROM clients 
WHERE contact_email = 'steve@jigr.app';