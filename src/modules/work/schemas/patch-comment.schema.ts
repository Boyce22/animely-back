import { z } from 'zod';

export const patchCommentSchema = z.object({
  content: z.string().min(1).max(2000).optional(),
  isSpoiler: z.boolean().optional(),
  isPinned: z.boolean().optional(),
});

export type PatchCommentInput = z.infer<typeof patchCommentSchema>;
