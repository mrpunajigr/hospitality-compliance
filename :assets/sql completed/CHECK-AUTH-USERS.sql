-- Check what users actually exist in auth.users table
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 10;

-- Check if there's a user with similar email (case sensitivity, spaces, etc.)
SELECT id, email FROM auth.users WHERE email ILIKE '%steve%' OR email ILIKE '%jigr%';