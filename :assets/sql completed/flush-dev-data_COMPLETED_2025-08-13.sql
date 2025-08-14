-- Data Flush Utility for Development Phase
-- Run this periodically to clean up all demo data during development
-- 
-- Usage: Execute this SQL in Supabase SQL Editor or via CLI

BEGIN;

-- Delete all delivery records for demo client
DELETE FROM delivery_records 
WHERE client_id = 'demo-client';

-- Delete all temperature readings (will cascade from delivery_records)
DELETE FROM temperature_readings 
WHERE delivery_record_id NOT IN (SELECT id FROM delivery_records);

-- Delete all compliance alerts for demo client
DELETE FROM compliance_alerts 
WHERE client_id = 'demo-client';

-- Delete all audit logs for demo client
DELETE FROM audit_logs 
WHERE client_id = 'demo-client';

-- Optional: Reset auto-incrementing sequences if needed
-- (Uncomment if you want to reset ID sequences)
-- SELECT setval(pg_get_serial_sequence('delivery_records','id'), 1, false);

COMMIT;

-- Verify cleanup
SELECT 
  (SELECT COUNT(*) FROM delivery_records WHERE client_id = 'demo-client') as delivery_records_count,
  (SELECT COUNT(*) FROM temperature_readings) as temperature_readings_count,
  (SELECT COUNT(*) FROM compliance_alerts WHERE client_id = 'demo-client') as compliance_alerts_count,
  (SELECT COUNT(*) FROM audit_logs WHERE client_id = 'demo-client') as audit_logs_count;