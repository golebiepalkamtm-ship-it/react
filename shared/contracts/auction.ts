import { z } from 'zod';

export const AuctionIdSchema = z.string().uuid();
export const BidIdSchema = z.string().uuid();
export const UserIdSchema = z.string().uuid();

export const BidderSchema = z.object({
  id: UserIdSchema,
  firstName: z.string(),
  lastName: z.string(),
  displayName: z.string().optional(),
});

export const BidSchema = z.object({
  id: BidIdSchema,
  amount: z.number().finite(),
  bidder: BidderSchema,
  createdAt: z.string(),
});

export const SellerSchema = z.object({
  id: UserIdSchema,
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  phoneNumber: z.string(),
  image: z.string().nullable(),
  rating: z.number().finite(),
  salesCount: z.number().int(),
});

export const AuctionCategorySchema = z.enum(['pigeons', 'supplements', 'accessories']);
export const AuctionStatusSchema = z.enum(['active', 'ended', 'cancelled']);

export const PigeonSchema = z
  .object({
    bloodline: z.string().optional(),
    achievements: z.string().optional(),
    eyeColor: z.string().optional(),
    color: z.string().optional(),
    vitality: z.string().optional(),
    endurance: z.string().optional(),
    gender: z.enum(['male', 'female']).optional(),
    ringNumber: z.string().optional(),
    listingType: z.enum(['auction', 'buy_now', 'both']).optional(),
    budowa: z.string().optional(),
  })
  .passthrough();

export const AuctionSchema = z.object({
  id: AuctionIdSchema,
  title: z.string(),
  description: z.string(),
  startingPrice: z.number().finite(),
  currentPrice: z.number().finite(),
  buyNowPrice: z.number().finite().optional(),
  reservePrice: z.number().finite().optional(),
  endTime: z.string(),
  snipeThresholdMinutes: z.number().int().optional(),
  snipeExtensionMinutes: z.number().int().optional(),
  minBidIncrement: z.number().finite().optional(),
  status: AuctionStatusSchema,
  reserveMet: z.boolean(),
  category: z.union([AuctionCategorySchema, z.string()]),
  pigeon: PigeonSchema,
  sex: z.enum(['male', 'female']),
  location: z.string(),
  seller: SellerSchema,
  images: z.array(z.string()),
  videos: z.array(z.string()).optional(),
  documents: z.array(z.string()).optional(),
  bids: z.array(BidSchema),
  _count: z.object({
    watchlist: z.number().int(),
    bids: z.number().int(),
  }),
});

// For creating a new auction, we don't need all fields (like id, currentPrice, etc.)
// And some fields are input as strings from forms
export const CreateAuctionSchema = z.object({
  title: z.string().min(3, "Tytuł musi mieć min. 3 znaki"),
  description: z.string().min(10, "Opis musi mieć min. 10 znaków"),
  startingPrice: z.number().min(100, "Cena wywoławcza min. 100 zł"),
  buyNowPrice: z.number().optional(),
  category: AuctionCategorySchema,
  sex: z.enum(['male', 'female']),
  location: z.string().min(2, "Podaj lokalizację"),
  pigeon: PigeonSchema,
  images: z.array(z.string()).min(1, "Wymagane min. 1 zdjęcie"),
  // Additional fields if needed for creation
  videos: z.array(z.string()).optional(),
  documents: z.array(z.string()).optional(),
  endTime: z.string().optional(), // Can be calculated on server or passed
});

export type Auction = z.infer<typeof AuctionSchema>;
export type AuctionStatus = z.infer<typeof AuctionStatusSchema>;
export type Bid = z.infer<typeof BidSchema>;
export type Bidder = z.infer<typeof BidderSchema>;
export type Seller = z.infer<typeof SellerSchema>;
export type AuctionCategory = z.infer<typeof AuctionCategorySchema>;
export type Pigeon = z.infer<typeof PigeonSchema>;
export type CreateAuctionRequest = z.infer<typeof CreateAuctionSchema>;
