import { z } from 'zod';

export const patchRatingSchema = z.object({
  score: z.number().min(0).max(10).multipleOf(0.01).optional(),
  review: z.string().max(5000).optional(),
});

export type PatchRatingInput = z.infer<typeof patchRatingSchema>;
