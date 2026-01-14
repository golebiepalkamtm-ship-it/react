-- Update existing user to admin role
UPDATE users 
SET role = 'ADMIN', name = 'Super Admin'
WHERE email = 'superadmin@palkamtm.pl';

-- Also update auth.users metadata
UPDATE auth.users 
SET raw_user_meta_data = jsonb_build_object('name', 'Super Admin', 'role', 'ADMIN')
WHERE email = 'superadmin@palkamtm.pl';
