-- Check exact user data
SELECT 
  u.id,
  u.email,
  u.role,
  u.name,
  u.created_at,
  u.updated_at
FROM users u
WHERE u.email = 'superadmin@palkamtm.pl';

-- Also check auth.users
SELECT 
  id,
  email,
  email_confirmed_at,
  raw_user_meta_data,
  created_at
FROM auth.users 
WHERE email = 'superadmin@palkamtm.pl';
