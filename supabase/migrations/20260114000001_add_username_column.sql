-- Add username column to users table (required field)
ALTER TABLE users ADD COLUMN username TEXT NOT NULL DEFAULT '';

-- Create a unique index for username
CREATE UNIQUE INDEX users_username_key ON users(username);

-- Add comment to the column
COMMENT ON COLUMN users.username IS 'Public username displayed in auctions instead of real name';
