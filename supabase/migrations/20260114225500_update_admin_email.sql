-- Update admin user email
UPDATE users 
SET email = 'superadmin@palkamtm.pl' 
WHERE email = 'golebie.palka.mtm@gmail.com';

-- Or create new admin user if it doesn't exist
INSERT INTO users (id, email, role, name) 
VALUES (
  gen_random_uuid(), 
  'superadmin@palkamtm.pl', 
  'ADMIN', 
  'Super Admin'
)
ON CONFLICT (email) DO UPDATE SET 
  role = 'ADMIN',
  name = 'Super Admin';
