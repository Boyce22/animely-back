import { z } from 'zod';

export const queryRatingsSchema = z.object({
  workId: z.uuid(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

export type QueryRatingsInput = z.infer<typeof queryRatingsSchema>;
