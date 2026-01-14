-- Check if user creation triggers are working properly

-- 1. Check existing users
SELECT COUNT(*) as total_users FROM public.users;

-- 2. Check auth users
SELECT COUNT(*) as total_auth_users, 
       COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) as email_verified,
       COUNT(CASE WHEN phone_confirmed_at IS NOT NULL THEN 1 END) as phone_verified
FROM auth.users;

-- 3. Check trigger functions
SELECT 
    proname as function_name,
    prosrc as source_code
FROM pg_proc 
WHERE proname LIKE '%handle_%' 
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- 4. Check triggers
SELECT 
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    tgfoid::regproc as function_name,
    tgtype as trigger_type
FROM pg_trigger 
WHERE tgname LIKE '%auth_user%' 
OR tgname LIKE '%on_auth_user%'
ORDER BY table_name, trigger_name;
