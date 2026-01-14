-- Add missing fields to users table
-- This migration adds role and avatar_url fields to match Prisma schema

-- Add role column
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'USER_REGISTERED';

-- Add check constraint for role
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('USER_REGISTERED', 'USER_EMAIL_VERIFIED', 'USER_FULL_VERIFIED', 'ADMIN'));

-- Add avatar_url column
ALTER TABLE users ADD COLUMN avatar_url TEXT;

-- Create index for role field
CREATE INDEX idx_users_role ON users(role);

-- Update existing users
UPDATE users SET role = 'USER_REGISTERED' WHERE role IS NULL;
