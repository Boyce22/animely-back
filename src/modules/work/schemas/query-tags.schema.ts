import { z } from 'zod';
import { TagType } from '@/shared/enums/tag-type';

export const queryTagsSchema = z.object({
  page: z.coerce.number().int().positive().min(1).default(1),
  limit: z.coerce.number().int().positive().max(100).min(1).default(50),
  search: z.string().optional(),
  type: z.nativeEnum(TagType).optional(),
  order: z.enum(['ASC', 'DESC']).default('ASC'),
});

export type QueryTagsInput = z.infer<typeof queryTagsSchema>;
