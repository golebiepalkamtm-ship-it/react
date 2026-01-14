-- Migration: Add Review model and Trust Score
-- Description: Create review system with ratings and comments

-- Create Review table
CREATE TABLE "reviews" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "auction_id" UUID NOT NULL,
  "reviewer_id" UUID NOT NULL,
  "reviewee_id" UUID NOT NULL,
  "rating" INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  "comment" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- Create indexes for better performance
CREATE INDEX "reviews_auction_id_idx" ON "reviews"("auction_id");
CREATE INDEX "reviews_reviewer_id_idx" ON "reviews"("reviewer_id");
CREATE INDEX "reviews_reviewee_id_idx" ON "reviews"("reviewee_id");
CREATE INDEX "reviews_rating_idx" ON "reviews"("rating");

-- Add foreign key constraints
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_auction_id_fkey" 
  FOREIGN KEY ("auction_id") REFERENCES "auctions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewer_id_fkey" 
  FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewee_id_fkey" 
  FOREIGN KEY ("reviewee_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- Add unique constraint to prevent duplicate reviews
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_unique_auction_reviewer" 
  UNIQUE ("auction_id", "reviewer_id");

-- Create trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER "reviews_updated_at" 
  BEFORE UPDATE ON "reviews" 
  FOR EACH ROW EXECUTE FUNCTION update_reviews_updated_at();

-- Add trust_score column to users table
ALTER TABLE "users" 
ADD COLUMN "trust_score" DECIMAL(3,2) DEFAULT 0.00;

-- Create index for trust_score
CREATE INDEX "users_trust_score_idx" ON "users"("trust_score");
