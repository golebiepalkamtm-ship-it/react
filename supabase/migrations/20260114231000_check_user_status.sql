-- Check user status in database
SELECT 
  u.id,
  u.email,
  u.role,
  u.name,
  u.created_at,
  u.updated_at,
  au.email_confirmed_at,
  au.phone_confirmed_at,
  au.raw_user_meta_data
FROM users u
LEFT JOIN auth.users au ON u.email = au.email
WHERE u.email = 'superadmin@palkamtm.pl';
