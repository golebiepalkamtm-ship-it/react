-- Test user creation and verification flow
-- This script tests the complete user creation and SMS verification process

-- 1. Check if triggers exist
SELECT 
    schemaname,
    tablename,
    triggername,
    action_timing,
    action_condition,
    action_statement
FROM pg_triggers 
WHERE schemaname = 'auth' OR schemaname = 'public'
ORDER BY schemaname, tablename, triggername;

-- 2. Test manual user creation (simulates auth.users insert)
DO $$
DECLARE
    test_user_id uuid := gen_random_uuid();
    test_email text := 'test@example.com';
BEGIN
    -- Insert into auth.users (this should trigger the user creation)
    INSERT INTO auth.users (
        id, 
        email, 
        created_at, 
        updated_at
    ) VALUES (
        test_user_id,
        test_email,
        NOW(),
        NOW()
    );
    
    RAISE NOTICE 'Test user created with ID: %', test_user_id;
END $$;

-- 3. Check if user was created in public.users
SELECT 
    id, 
    email, 
    role, 
    created_at, 
    updated_at 
FROM public.users 
WHERE email = 'test@example.com';

-- 4. Test email confirmation (simulates email verification)
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'test@example.com';

-- 5. Check role after email confirmation
SELECT 
    id, 
    email, 
    role, 
    created_at, 
    updated_at 
FROM public.users 
WHERE email = 'test@example.com';

-- 6. Test phone confirmation (simulates SMS verification)
UPDATE auth.users 
SET phone = '+48123456789',
    phone_confirmed_at = NOW() 
WHERE email = 'test@example.com';

-- 7. Check final role after phone confirmation
SELECT 
    id, 
    email, 
    phone,
    role, 
    created_at, 
    updated_at 
FROM public.users 
WHERE email = 'test@example.com';

-- 8. Clean up test data
DELETE FROM public.users WHERE email = 'test@example.com';
DELETE FROM auth.users WHERE email = 'test@example.com';
