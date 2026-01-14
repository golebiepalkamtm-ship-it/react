-- Migration: Add proxy bidding and notifications
-- Description: Add isProxy and maxBid fields to Bid model, create Notification model

-- Add proxy bidding fields to Bid table
ALTER TABLE "bids" 
ADD COLUMN "is_proxy" BOOLEAN DEFAULT false,
ADD COLUMN "max_bid" DECIMAL(12,2);

-- Create Notification table
CREATE TABLE "notifications" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "user_id" UUID NOT NULL,
  "auction_id" UUID,
  "type" VARCHAR(50) NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "message" TEXT NOT NULL,
  "read" BOOLEAN DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- Create indexes for better performance
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");
CREATE INDEX "notifications_auction_id_idx" ON "notifications"("auction_id");
CREATE INDEX "notifications_read_idx" ON "notifications"("read");
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- Add foreign key constraints
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" 
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "notifications" ADD CONSTRAINT "notifications_auction_id_fkey" 
  FOREIGN KEY ("auction_id") REFERENCES "auctions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- Create trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER "notifications_updated_at" 
  BEFORE UPDATE ON "notifications" 
  FOR EACH ROW EXECUTE FUNCTION update_notifications_updated_at();
