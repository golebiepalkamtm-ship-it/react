import { z } from "zod";

export const UserRoleSchema = z.enum([
  "USER_REGISTERED",
  "USER_EMAIL_VERIFIED",
  "USER_FULL_VERIFIED",
  "ADMIN",
]);

export const UserUpdateSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  role: UserRoleSchema.optional(),
  isBlocked: z.boolean().optional(),
  isBanned: z.boolean().optional(),
  username: z.string().min(1).optional(),
  phone: z.string().optional(),
});

export const AuctionStatusSchema = z.enum(["ACTIVE", "ENDED", "CANCELLED"]);
export const AuctionCategorySchema = z.enum([
  "PIGEONS",
  "SUPPLEMENTS",
  "ACCESSORIES",
]);
export const SexSchema = z.enum(["MALE", "FEMALE"]);

export const AuctionCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  startingPrice: z.coerce.number().nonnegative().optional(),
  buyNowPrice: z.coerce.number().nonnegative().optional(),
  reservePrice: z.coerce.number().nonnegative().optional(),
  status: AuctionStatusSchema.optional(),
  endTime: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    })
    .optional(),
  sellerId: z.string().uuid().optional(),
  category: AuctionCategorySchema.optional(),
  sex: SexSchema.optional(),
  minBidIncrement: z.coerce.number().positive().optional(),
});

export const AuctionUpdateSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  startingPrice: z.coerce.number().nonnegative().nullable().optional(),
  buyNowPrice: z.coerce.number().nonnegative().nullable().optional(),
  reservePrice: z.coerce.number().nonnegative().nullable().optional(),
  status: AuctionStatusSchema.optional(),
  endTime: z
    .string()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    })
    .nullable()
    .optional(),
  category: AuctionCategorySchema.optional(),
  sex: SexSchema.optional(),
  minBidIncrement: z.coerce.number().positive().optional(),
});

export const UserCreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  role: UserRoleSchema.optional(),
  phone: z.string().optional(),
  username: z.string().min(1),
  isBlocked: z.boolean().optional(),
  isBanned: z.boolean().optional(),
});

export const UserRoleUpdateBodySchema = z.object({
  role: UserRoleSchema,
});
