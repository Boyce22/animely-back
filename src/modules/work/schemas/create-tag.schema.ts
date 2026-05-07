import { z } from 'zod';
import { TagType } from '@/shared/enums/tag-type';

export const createTagSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  type: z.enum(TagType).default(TagType.GENRE),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color (e.g. #FF5733)')
    .optional(),
});

export type CreateTagInput = z.infer<typeof createTagSchema>;
