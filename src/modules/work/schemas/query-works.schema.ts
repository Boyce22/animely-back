import { z } from 'zod';
import { VisibilityStatus } from '@/shared/enums/visibility-status';
import { PublicationStatus } from '@/shared/enums/publication-status';
import { ModerationStatus } from '@/shared/enums/moderation-status';
import { WorkType } from '@/modules/work/enums/work-type';

export const queryWorksSchema = z.object({
  page: z.coerce.number().int().positive().min(1).default(1),
  limit: z.coerce.number().int().positive().max(100).min(1).default(20),
  title: z.string().optional(),
  search: z.string().optional(),
  type: z.enum(WorkType).optional(),
  demographic: z.string().optional(),
  contentRating: z.string().optional(),
  publicationStatus: z.enum(PublicationStatus).optional(),
  visibilityStatus: z.enum(VisibilityStatus).optional(),
  moderationStatus: z.enum(ModerationStatus).optional(),
  startYear: z.coerce.number().int().optional(),
  endYear: z.coerce.number().int().optional(),
  tags: z.preprocess(
    (v) =>
      typeof v === 'string'
        ? v
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : v,
    z.array(z.string()).optional(),
  ),
  minRating: z.coerce.number().min(0).max(10).optional(),
  sortBy: z.enum(['popularityScore', 'bayesianScore', 'startYear', 'title']).default('popularityScore'),
  order: z.enum(['ASC', 'DESC']).default('DESC'),
});

export type QueryWorksInput = z.infer<typeof queryWorksSchema>;
