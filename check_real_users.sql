-- Check what real users exist in profiles table
SELECT id, email, full_name, created_at 
FROM profiles 
ORDER BY created_at DESC;