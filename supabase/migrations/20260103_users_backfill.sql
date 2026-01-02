-- Backfill public.users for any existing auth.users
INSERT INTO users (id, email, role, created_at, updated_at)
SELECT u.id, u.email, 'USER_REGISTERED', TIMEZONE('utc', NOW()), TIMEZONE('utc', NOW())
FROM auth.users u
LEFT JOIN users p ON p.id = u.id
WHERE p.id IS NULL;
