-- Migration: Add Saved Search functionality
-- Description: Create saved searches table for AI-powered search functionality

-- Create SavedSearch table
CREATE TABLE "saved_searches" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "user_id" UUID NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "filters" JSONB NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "saved_searches_pkey" PRIMARY KEY ("id")
);

-- Create indexes for better performance
CREATE INDEX "saved_searches_user_id_idx" ON "saved_searches"("user_id");
CREATE INDEX "saved_searches_is_active_idx" ON "saved_searches"("is_active");
CREATE INDEX "saved_searches_created_at_idx" ON "saved_searches"("created_at");

-- Add foreign key constraint
ALTER TABLE "saved_searches" ADD CONSTRAINT "saved_searches_user_id_fkey" 
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- Create trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_saved_searches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER "saved_searches_updated_at" 
  BEFORE UPDATE ON "saved_searches" 
  FOR EACH ROW EXECUTE FUNCTION update_saved_searches_updated_at();

-- Add indexes for better search performance on auctions
CREATE INDEX IF NOT EXISTS "auctions_title_gin_idx" ON "auctions" USING gin(to_tsvector('english', "title"));
CREATE INDEX IF NOT EXISTS "auctions_description_gin_idx" ON "auctions" USING gin(to_tsvector('english', "description"));
CREATE INDEX IF NOT EXISTS "auctions_category_idx" ON "auctions"("category");
CREATE INDEX IF NOT EXISTS "auctions_status_idx" ON "auctions"("status");
CREATE INDEX IF NOT EXISTS "auctions_current_price_idx" ON "auctions"("current_price");
CREATE INDEX IF NOT EXISTS "auctions_ends_at_idx" ON "auctions"("ends_at");

-- Composite index for common search patterns
CREATE INDEX IF NOT EXISTS "auctions_status_category_price_idx" ON "auctions"("status", "category", "current_price");
