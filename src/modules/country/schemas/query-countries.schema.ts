import { z } from 'zod';

export const queryCountriesSchema = z.object({
  cursor: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).min(1).default(20),
  search: z.string().trim().optional(),
  order: z.enum(['asc', 'desc']).default('asc'),
});

export type QueryCountriesInput = z.infer<typeof queryCountriesSchema>;
