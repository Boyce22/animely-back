import { z } from 'zod';

export const createRatingSchema = z.object({
  workId: z.uuid(),
  score: z.number().min(0).max(10).multipleOf(0.01),
  review: z.string().max(5000).optional(),
});

export type CreateRatingInput = z.infer<typeof createRatingSchema>;
