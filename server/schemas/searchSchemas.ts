import { z } from 'zod';

export const advancedSearchSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['all', 'active', 'ended', 'cancelled']).optional(),
  category: z.string().optional(),
  gender: z.enum(['all', 'male', 'female']).optional(),
  priceRange: z.object({
    min: z.number().min(0).optional(),
    max: z.number().min(0).optional(),
  }).optional(),
  ringNumber: z.string().optional(),
  eyeColor: z.string().optional(),
  pigeonColor: z.string().optional(),
  breeder: z.string().optional(),
  sortBy: z.enum(['newest', 'ending-soon', 'price-low', 'price-high']).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  page: z.number().int().min(1).optional(),
});

export const savedSearchSchema = z.object({
  name: z.string().min(1, 'Search name is required').max(50),
  filters: advancedSearchSchema,
  isActive: z.boolean().default(true),
});

export type AdvancedSearchFilters = z.infer<typeof advancedSearchSchema>;
export type SavedSearchData = z.infer<typeof savedSearchSchema>;
