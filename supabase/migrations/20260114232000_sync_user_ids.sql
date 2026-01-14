-- Fix admin user ID sync
-- Update the users table to match auth.users ID

UPDATE users 
SET id = au.id
FROM auth.users au
WHERE users.email = au.email AND users.email = 'superadmin@palkamtm.pl';

-- Check the result
SELECT 
  u.id,
  u.email,
  u.role,
  u.name,
  au.id as auth_id,
  au.email as auth_email
FROM users u
LEFT JOIN auth.users au ON u.id = au.id
WHERE u.email = 'superadmin@palkamtm.pl';
