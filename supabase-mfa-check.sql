-- Check MFA factors for your user
SELECT 
  u.id as user_id,
  u.email,
  u.created_at as user_created,
  mf.id as factor_id,
  mf.factor_type,
  mf.status,
  mf.friendly_name,
  mf.created_at as factor_created,
  mf.updated_at as factor_updated
FROM auth.users u
LEFT JOIN auth.mfa_factors mf ON u.id = mf.user_id
WHERE u.email = 'mrpuna+corellis83@gmail.com'
ORDER BY mf.created_at DESC;

-- Also check for any MFA challenges
SELECT 
  mc.id as challenge_id,
  mc.factor_id,
  mc.created_at as challenge_created,
  mc.verified_at,
  mc.ip_address,
  mf.status as factor_status
FROM auth.mfa_challenges mc
JOIN auth.mfa_factors mf ON mc.factor_id = mf.id
JOIN auth.users u ON mf.user_id = u.id
WHERE u.email = 'mrpuna+corellis83@gmail.com'
ORDER BY mc.created_at DESC
LIMIT 10;