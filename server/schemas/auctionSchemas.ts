import { z } from 'zod';

// UUID v4 validation regex
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const createAuctionSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title must be at most 200 characters'),
  description: z.string().max(5000, 'Description must be at most 5000 characters').optional(),
  startingPrice: z.number().positive('Starting price must be positive').optional(),
  buyNowPrice: z.number().positive('Buy now price must be positive').optional(),
  reservePrice: z.number().positive('Reserve price must be positive').optional(),
  endTime: z.string().datetime('Invalid date format').or(z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format')).refine((val) => {
    const date = new Date(val);
    const now = new Date();
    now.setMinutes(now.getMinutes() - 1); // Allow 1 minute grace
    return date > now;
  }, 'End time must be in the future'),
  category: z.string().max(100).optional(),
  pigeon: z.object({
    gender: z.enum(['male', 'female']).optional(),
    ringNumber: z.string().trim().max(100).optional(),
    eyeColor: z.string().max(50).optional(),
    pigeonColor: z.string().max(100).optional(),
    construction: z.string().max(200).optional(),
    vitality: z.string().max(100).optional(),
    length: z.string().max(100).optional(),
    endurance: z.string().max(100).optional(),
    forkStrength: z.string().max(100).optional(),
    forkAlignment: z.string().max(100).optional(),
    muscles: z.string().max(100).optional(),
    balance: z.string().max(100).optional(),
    back: z.string().max(100).optional(),
    purpose: z.string().max(200).optional(),
  }).optional(),
  sex: z.string().optional(),
  location: z.string().max(200).optional(),
  // Upload service zwraca już absolutne URL, ale środowisko dev może używać lokalnych ścieżek;
  // dopuszczamy dowolny niepusty string, bez wymuszania url(), by uniknąć fałszywych 400.
  images: z.array(z.string().trim().min(1, 'Image URL required')).max(20, 'Too many images').optional(),
  videos: z.array(z.string().trim().min(1, 'Video URL required')).max(10, 'Too many videos').optional(),
  documents: z.array(z.string().trim().min(1, 'Document URL required')).max(10, 'Too many documents').optional(),
}).refine((data) => {
  const hasStart = typeof data.startingPrice === 'number';
  const hasBuyNow = typeof data.buyNowPrice === 'number';
  if (hasStart && hasBuyNow && data.startingPrice! >= data.buyNowPrice!) {
    return false;
  }
  return true;
}, {
  message: 'Buy now price must be greater than starting price',
  path: ['buyNowPrice']
}).refine((data) => {
  const hasStart = typeof data.startingPrice === 'number';
  const hasReserve = typeof data.reservePrice === 'number';
  if (hasStart && hasReserve && data.startingPrice! >= data.reservePrice!) {
    return false;
  }
  return true;
}, {
  message: 'Reserve price must be greater than starting price',
  path: ['reservePrice']
});

export const placeBidSchema = z.object({
  amount: z.number()
    .positive('Amount must be positive')
    .finite('Amount must be a valid number')
    .min(0.01, 'Minimum bid is 0.01')
    .max(1000000, 'Maximum bid is 1,000,000'),
  isProxy: z.boolean().optional(),
  maxBid: z.number()
    .positive('Max bid must be positive')
    .finite('Max bid must be a valid number')
    .min(0.01, 'Minimum bid is 0.01')
    .max(1000000, 'Maximum bid is 1,000,000')
    .optional(),
}).refine((data) => {
  if (data.isProxy && (!data.maxBid || data.maxBid <= data.amount)) {
    return false;
  }
  return true;
}, {
  message: 'Max bid must be greater than amount for proxy bidding',
  path: ['maxBid']
});

export const buyNowSchema = z.object({
  auctionId: z.string().regex(uuidRegex, 'Invalid auction ID format'),
});

export const queryParamsSchema = z.object({
  status: z.enum(['all', 'active', 'ended', 'cancelled']).optional(),
  sortBy: z.enum(['price-high', 'price-low', 'newest', 'ending-soon']).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
  search: z.string().max(200).optional(),
  category: z.enum(['all', 'racing', 'breeding', 'show']).optional(),
  gender: z.enum(['all', 'male', 'female']).optional(),
  priceMin: z.string().regex(/^\d+(\.\d+)?$/).transform(Number).pipe(z.number().nonnegative()).optional(),
  priceMax: z.string().regex(/^\d+(\.\d+)?$/).transform(Number).pipe(z.number().nonnegative()).optional(),
});

export const auctionIdParamSchema = z.object({
  id: z.string().regex(uuidRegex, 'Invalid auction ID format'),
});

export const adminUpdateAuctionSchema = z.object({
  currentPrice: z.number().positive('Current price must be positive').optional(),
  buyNowPrice: z.number().positive('Buy now price must be positive').optional(),
  endTime: z.string().datetime('Invalid date format for end time').optional(),
});

export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1)).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1).max(100)).default('20'),
});

