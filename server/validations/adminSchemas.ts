
import { z } from 'zod';

export const UserRoleSchema = z.enum(['USER_REGISTERED', 'USER_EMAIL_VERIFIED', 'USER_FULL_VERIFIED', 'ADMIN']);

export const UserUpdateSchema = z.object({
  email: z.string().email().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  role: UserRoleSchema.optional(),
  isBlocked: z.boolean().optional(),
  isBanned: z.boolean().optional(),
  username: z.string().min(1).optional(),
});

export const AuctionStatusSchema = z.enum(['ACTIVE', 'ENDED', 'CANCELLED']);
export const AuctionCategorySchema = z.enum(['RACING', 'BREEDING', 'SHOW', 'SUPPLEMENTS', 'ACCESSORIES']);
export const SexSchema = z.enum(['MALE', 'FEMALE']);

export const AuctionCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  startingPrice: z.number().nonnegative().optional(),
  buyNowPrice: z.number().nonnegative().optional(),
  reservePrice: z.number().nonnegative().optional(),
  status: AuctionStatusSchema.optional(),
  endTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }).optional(),
  sellerId: z.string().uuid().optional(),
  category: AuctionCategorySchema.optional(),
  sex: SexSchema.optional(),
  minBidIncrement: z.number().positive().optional(),
});

export const AuctionUpdateSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  startingPrice: z.number().nonnegative().optional(),
  buyNowPrice: z.number().nonnegative().optional(),
  reservePrice: z.number().nonnegative().optional(),
  status: AuctionStatusSchema.optional(),
  endTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }).optional(),
});

export const UserCreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  role: UserRoleSchema.optional(),
  phone: z.string().optional(),
  username: z.string().min(1),
});

export const UserRoleUpdateBodySchema = z.object({
  role: UserRoleSchema,
});
