import { z } from 'zod';
import { AuctionIdSchema, BidSchema } from './auction.js';

export const PlaceBidRequestSchema = z.object({
  amount: z.number().finite().positive(),
  displayName: z.string().optional(),
});

export type PlaceBidRequest = z.infer<typeof PlaceBidRequestSchema>;

export const BidMetaSchema = z.object({
  wasExtended: z.boolean(),
  newEndTime: z.string().nullable(),
  autoBidTriggered: z.boolean(),
});

export const PlaceBidResponseSchema = z.object({
  success: z.boolean(),
  bid: BidSchema,
  meta: BidMetaSchema,
});

export type PlaceBidResponse = z.infer<typeof PlaceBidResponseSchema>;

export const BidErrorTypeSchema = z.enum([
  'INSUFFICIENT_FUNDS',
  'AUCTION_ENDED',
  'OUTBID',
  'VALIDATION',
  'AUTH',
  'UNKNOWN',
]);

export type BidErrorType = z.infer<typeof BidErrorTypeSchema>;

export const BidErrorPayloadSchema = z.object({
  type: BidErrorTypeSchema,
  message: z.string(),
  auctionId: AuctionIdSchema.optional(),
});

export type BidErrorPayload = z.infer<typeof BidErrorPayloadSchema>;

