import { z } from 'zod';

export const queryCommentsSchema = z.object({
  workId: z.uuid(),
  chapterId: z.uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

export type QueryCommentsInput = z.infer<typeof queryCommentsSchema>;
