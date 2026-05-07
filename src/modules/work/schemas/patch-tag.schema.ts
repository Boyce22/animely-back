import { z } from 'zod';
import { createTagSchema } from './create-tag.schema';

export const patchTagSchema = createTagSchema.partial()

export type PatchTagInput = z.infer<typeof patchTagSchema>;
