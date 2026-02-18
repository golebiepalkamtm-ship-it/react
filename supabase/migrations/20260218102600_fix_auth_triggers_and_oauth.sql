-- Fix auth triggers and ensure OAuth users are automatically verified
-- This migration restores missing triggers and improves user creation logic
-- 1. Unified function to sync user from auth.users to public.users
CREATE OR REPLACE FUNCTION public.sync_user_record(p_user_id UUID) RETURNS VOID SECURITY DEFINER
SET search_path TO public LANGUAGE plpgsql AS $$
DECLARE v_auth_user RECORD;
v_username TEXT;
v_role "UserRole";
v_first_name TEXT;
v_last_name TEXT;
v_avatar_url TEXT;
v_email TEXT;
v_full_name TEXT;
BEGIN -- Get user data from auth.users
SELECT *
FROM auth.users
WHERE id = p_user_id INTO v_auth_user;
IF v_auth_user IS NULL THEN RETURN;
END IF;
-- Determine email
v_email := v_auth_user.email;
IF v_email IS NULL THEN v_email := (v_auth_user.raw_user_meta_data->>'email');
END IF;
-- Determine role
-- For OAuth providers (google, facebook), we default to EMAIL_VERIFIED
IF v_auth_user.raw_app_meta_data->>'provider' IN ('google', 'facebook')
OR v_auth_user.raw_user_meta_data->>'provider' IN ('google', 'facebook')
OR v_auth_user.email_confirmed_at IS NOT NULL THEN v_role := 'USER_EMAIL_VERIFIED'::"UserRole";
ELSE v_role := 'USER_REGISTERED'::"UserRole";
END IF;
-- Extract metadata
v_first_name := COALESCE(
    v_auth_user.raw_user_meta_data->>'first_name',
    v_auth_user.raw_user_meta_data->>'given_name'
);
v_last_name := COALESCE(
    v_auth_user.raw_user_meta_data->>'last_name',
    v_auth_user.raw_user_meta_data->>'family_name'
);
v_avatar_url := COALESCE(
    v_auth_user.raw_user_meta_data->>'avatar_url',
    v_auth_user.raw_user_meta_data->>'picture'
);
v_full_name := COALESCE(
    v_auth_user.raw_user_meta_data->>'full_name',
    v_auth_user.raw_user_meta_data->>'name'
);
-- Generate username if missing in public.users
SELECT username
FROM public.users
WHERE id = p_user_id INTO v_username;
IF v_username IS NULL THEN -- Try to use name, email base, or a default
v_username := COALESCE(
    v_full_name,
    split_part(v_email, '@', 1),
    'user'
);
-- Sanitize: only alphanumeric, lowercase
v_username := lower(
    regexp_replace(v_username, '[^a-zA-Z0-9]', '', 'g')
);
-- Ensure minimal length
IF length(v_username) < 3 THEN v_username := v_username || 'u';
END IF;
-- Append unique suffix from ID to ensure uniqueness
v_username := v_username || '_' || substr(p_user_id::text, 1, 4);
-- Final check on length
v_username := substr(v_username, 1, 32);
END IF;
INSERT INTO public.users (
        id,
        email,
        role,
        username,
        first_name,
        last_name,
        avatar_url,
        name,
        updated_at
    )
VALUES (
        p_user_id,
        v_email,
        v_role,
        v_username,
        v_first_name,
        v_last_name,
        v_avatar_url,
        v_full_name,
        NOW()
    ) ON CONFLICT (id) DO
UPDATE
SET email = COALESCE(EXCLUDED.email, public.users.email),
    role = CASE
        -- Only upgrade from REGISTERED to EMAIL_VERIFIED
        WHEN public.users.role = 'USER_REGISTERED'::"UserRole"
        AND EXCLUDED.role = 'USER_EMAIL_VERIFIED'::"UserRole" THEN 'USER_EMAIL_VERIFIED'::"UserRole"
        ELSE public.users.role
    END,
    updated_at = NOW(),
    name = COALESCE(EXCLUDED.name, public.users.name, v_full_name),
    avatar_url = COALESCE(
        EXCLUDED.avatar_url,
        public.users.avatar_url,
        v_avatar_url
    );
END;
$$;
-- 2. Trigger function that calls the sync function
CREATE OR REPLACE FUNCTION public.on_auth_user_change() RETURNS TRIGGER SECURITY DEFINER
SET search_path TO public LANGUAGE plpgsql AS $$ BEGIN PERFORM public.sync_user_record(NEW.id);
RETURN NEW;
END;
$$;
-- 3. Set up triggers on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.on_auth_user_change();
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
AFTER
UPDATE ON auth.users FOR EACH ROW EXECUTE FUNCTION public.on_auth_user_change();
-- 4. Sync all existing users immediately
DO $$
DECLARE r RECORD;
BEGIN FOR r IN
SELECT id
FROM auth.users LOOP BEGIN PERFORM public.sync_user_record(r.id);
EXCEPTION
WHEN OTHERS THEN RAISE NOTICE 'Could not sync user %: %',
r.id,
SQLERRM;
END;
END LOOP;
END $$;