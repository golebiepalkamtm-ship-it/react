-- Alter target_id to be TEXT to support 'global' and other non-UUID strings
ALTER TABLE "metrics" ALTER COLUMN "target_id" TYPE TEXT;
ALTER TABLE "metrics" ALTER COLUMN "target_id" SET DEFAULT 'global';
