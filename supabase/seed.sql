-- Hospitality Compliance SaaS - Seed Data for Testing
-- This file creates sample data for development and testing

-- =====================================================
-- SAMPLE CLIENTS
-- =====================================================

-- Insert sample clients (restaurants/cafes)
INSERT INTO clients (id, name, business_type, license_number, business_email, phone, address, subscription_status, subscription_tier, estimated_monthly_deliveries) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'The Cornerstone Cafe', 'cafe', 'LA123456', 'manager@cornerstonecafe.co.nz', '+64 9 123 4567', '{"street": "123 Queen Street", "city": "Auckland", "region": "Auckland", "postalCode": "1010", "country": "NZ"}', 'active', 'basic', 300),
('550e8400-e29b-41d4-a716-446655440002', 'Waterfront Restaurant', 'restaurant', 'LA789012', 'admin@waterfrontrestaurant.co.nz', '+64 4 987 6543', '{"street": "45 Harbour View", "city": "Wellington", "region": "Wellington", "postalCode": "6011", "country": "NZ"}', 'trial', 'professional', 800),
('550e8400-e29b-41d4-a716-446655440003', 'Hillside Hotel & Bar', 'hotel', 'LA345678', 'owner@hillsidehotel.co.nz', '+64 3 555 1234', '{"street": "78 Mountain Road", "city": "Queenstown", "region": "Otago", "postalCode": "9300", "country": "NZ"}', 'active', 'enterprise', 1200);

-- =====================================================
-- SAMPLE USERS (PROFILES)
-- Note: In real app, these would be created via Supabase Auth
-- =====================================================

-- Sample user profiles (these IDs would normally come from auth.users)
INSERT INTO profiles (id, email, full_name, phone) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'sarah.manager@cornerstonecafe.co.nz', 'Sarah Wilson', '+64 21 123 456'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'john.staff@cornerstonecafe.co.nz', 'John Smith', '+64 21 789 012'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'maria.admin@waterfrontrestaurant.co.nz', 'Maria Rodriguez', '+64 27 345 678'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'david.owner@hillsidehotel.co.nz', 'David Thompson', '+64 21 901 234');

-- =====================================================
-- CLIENT-USER RELATIONSHIPS
-- =====================================================

-- Assign users to clients with different roles
INSERT INTO client_users (user_id, client_id, role, status, joined_at) VALUES
-- Cornerstone Cafe users
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', '550e8400-e29b-41d4-a716-446655440001', 'manager', 'active', NOW()),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', '550e8400-e29b-41d4-a716-446655440001', 'staff', 'active', NOW()),
-- Waterfront Restaurant users  
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', '550e8400-e29b-41d4-a716-446655440002', 'admin', 'active', NOW()),
-- Hillside Hotel users
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', '550e8400-e29b-41d4-a716-446655440003', 'owner', 'active', NOW());

-- =====================================================
-- SAMPLE SUPPLIERS
-- =====================================================

INSERT INTO suppliers (client_id, name, contact_email, contact_phone, delivery_schedule, product_types, temperature_requirements) VALUES
-- Suppliers for Cornerstone Cafe
('550e8400-e29b-41d4-a716-446655440001', 'Fresh Dairy Co', 'orders@freshdairy.co.nz', '+64 9 456 7890', '["monday", "wednesday", "friday"]', '["dairy", "chilled"]', '{"chilled": {"min": 0, "max": 4}}'),
('550e8400-e29b-41d4-a716-446655440001', 'Auckland Meat Supply', 'delivery@aucklandmeat.co.nz', '+64 9 789 0123', '["tuesday", "thursday"]', '["meat", "chilled"]', '{"chilled": {"min": 0, "max": 4}}'),

-- Suppliers for Waterfront Restaurant
('550e8400-e29b-41d4-a716-446655440002', 'Wellington Seafood', 'orders@wellingtonseafood.co.nz', '+64 4 123 4567', '["monday", "tuesday", "wednesday", "thursday", "friday"]', '["seafood", "chilled"]', '{"chilled": {"min": 0, "max": 2}}'),
('550e8400-e29b-41d4-a716-446655440002', 'Frozen Foods Ltd', 'delivery@frozenfoods.co.nz', '+64 4 890 1234', '["monday", "thursday"]', '["frozen"]', '{"frozen": {"min": -25, "max": -18}}'),

-- Suppliers for Hillside Hotel  
('550e8400-e29b-41d4-a716-446655440003', 'Otago Produce', 'orders@otagoproduce.co.nz', '+64 3 567 8901', '["daily"]', '["vegetables", "ambient"]', '{"ambient": {"min": 5, "max": 25}}'),
('550e8400-e29b-41d4-a716-446655440003', 'Premium Beverages', 'delivery@premiumbev.co.nz', '+64 3 234 5678', '["tuesday", "friday"]', '["beverages", "ambient"]', '{"ambient": {"min": 5, "max": 25}}');

-- =====================================================
-- SAMPLE DELIVERY RECORDS
-- =====================================================

-- Sample delivery records with different processing statuses
INSERT INTO delivery_records (client_id, user_id, supplier_id, supplier_name, image_path, docket_number, delivery_date, processing_status, confidence_score) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', (SELECT id FROM suppliers WHERE name = 'Fresh Dairy Co' LIMIT 1), 'Fresh Dairy Co', '550e8400-e29b-41d4-a716-446655440001/2024-01-15/docket-001.jpg', 'FD-2024-0115', NOW() - INTERVAL '2 hours', 'completed', 0.95),
('550e8400-e29b-41d4-a716-446655440001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', (SELECT id FROM suppliers WHERE name = 'Auckland Meat Supply' LIMIT 1), 'Auckland Meat Supply', '550e8400-e29b-41d4-a716-446655440001/2024-01-15/docket-002.jpg', 'AMS-2024-0115', NOW() - INTERVAL '1 hour', 'completed', 0.88),
('550e8400-e29b-41d4-a716-446655440002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', (SELECT id FROM suppliers WHERE name = 'Wellington Seafood' LIMIT 1), 'Wellington Seafood', '550e8400-e29b-41d4-a716-446655440002/2024-01-15/docket-003.jpg', 'WS-2024-0115', NOW() - INTERVAL '30 minutes', 'processing', null);

-- =====================================================
-- SAMPLE TEMPERATURE READINGS
-- =====================================================

-- Temperature readings for the completed delivery records
INSERT INTO temperature_readings (delivery_record_id, temperature_value, temperature_unit, product_type, is_compliant, risk_level, safe_min_temp, safe_max_temp, context) VALUES
-- Fresh Dairy Co delivery - compliant
((SELECT id FROM delivery_records WHERE docket_number = 'FD-2024-0115'), 2.5, 'C', 'chilled', true, 'low', 0, 4, 'Dairy products temperature: 2.5°C'),
-- Auckland Meat Supply delivery - violation
((SELECT id FROM delivery_records WHERE docket_number = 'AMS-2024-0115'), 7.2, 'C', 'chilled', false, 'critical', 0, 4, 'Meat temperature: 7.2°C - VIOLATION');

-- =====================================================
-- SAMPLE COMPLIANCE ALERTS
-- =====================================================

-- Create alert for the temperature violation
INSERT INTO compliance_alerts (delivery_record_id, client_id, alert_type, severity, temperature_value, supplier_name, message, requires_acknowledgment) VALUES
((SELECT id FROM delivery_records WHERE docket_number = 'AMS-2024-0115'), '550e8400-e29b-41d4-a716-446655440001', 'temperature_violation', 'critical', 7.2, 'Auckland Meat Supply', 'Critical temperature violation: Meat delivery received at 7.2°C (safe maximum: 4°C). Immediate action required.', true);

-- =====================================================
-- SAMPLE COMPLIANCE SETTINGS
-- =====================================================

-- Default compliance settings for each client
INSERT INTO compliance_settings (client_id, rules, alert_preferences, notification_emails) VALUES
('550e8400-e29b-41d4-a716-446655440001', 
 '{"temperature_violations": {"chilled_max": 4, "frozen_min": -18, "ambient_max": 25, "alert_threshold": "immediate"}, "documentation_requirements": {"photo_required": true, "temperature_required": true, "supplier_verification": true}}',
 '{"email": {"enabled": true, "critical_only": false}, "sms": {"enabled": true, "critical_only": true}}',
 '["sarah.manager@cornerstonecafe.co.nz"]'),

('550e8400-e29b-41d4-a716-446655440002',
 '{"temperature_violations": {"chilled_max": 2, "frozen_min": -18, "ambient_max": 25, "alert_threshold": "immediate"}, "documentation_requirements": {"photo_required": true, "temperature_required": true, "supplier_verification": true}}',
 '{"email": {"enabled": true, "critical_only": false}, "sms": {"enabled": true, "critical_only": true}}', 
 '["maria.admin@waterfrontrestaurant.co.nz"]'),

('550e8400-e29b-41d4-a716-446655440003',
 '{"temperature_violations": {"chilled_max": 4, "frozen_min": -18, "ambient_max": 25, "alert_threshold": "immediate"}, "documentation_requirements": {"photo_required": true, "temperature_required": true, "supplier_verification": true}}',
 '{"email": {"enabled": true, "critical_only": false}, "sms": {"enabled": false, "critical_only": true}}',
 '["david.owner@hillsidehotel.co.nz"]');

-- =====================================================
-- SAMPLE AUDIT LOGS
-- =====================================================

INSERT INTO audit_logs (client_id, user_id, action, resource_type, resource_id, details) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'document.uploaded', 'delivery_record', (SELECT id::text FROM delivery_records WHERE docket_number = 'FD-2024-0115'), '{"file_name": "docket-001.jpg", "file_size": 2048576}'),
('550e8400-e29b-41d4-a716-446655440001', null, 'document.processed', 'delivery_record', (SELECT id::text FROM delivery_records WHERE docket_number = 'FD-2024-0115'), '{"processing_time_ms": 3200, "confidence_score": 0.95}'),
('550e8400-e29b-41d4-a716-446655440001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'document.uploaded', 'delivery_record', (SELECT id::text FROM delivery_records WHERE docket_number = 'AMS-2024-0115'), '{"file_name": "docket-002.jpg", "file_size": 1875432}'),
('550e8400-e29b-41d4-a716-446655440001', null, 'violation.detected', 'compliance_alert', (SELECT id::text FROM compliance_alerts WHERE temperature_value = 7.2), '{"violation_type": "temperature", "temperature": 7.2, "threshold": 4}');