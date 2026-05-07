import { z } from 'zod';

export const createCommentSchema = z.object({
  content: z.string().min(1).max(2000),
  workId: z.uuid(),
  chapterId: z.uuid().optional(),
  parentCommentId: z.uuid().optional(),
  isSpoiler: z.boolean().default(false),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
