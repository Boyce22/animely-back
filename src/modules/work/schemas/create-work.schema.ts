import { z } from 'zod';
import { VisibilityStatus } from '@/shared/enums/visibility-status';
import { PublicationStatus } from '@/shared/enums/publication-status';
import { ModerationStatus } from '@/shared/enums/moderation-status';
import { WorkType } from '@/modules/work/enums/work-type';

export const mangaWorkTypes = [
  WorkType.MANGA,
  WorkType.MANHWA,
  WorkType.MANHUA,
  WorkType.NOVEL,
  WorkType.ONE_SHOT,
] as const;

export const animeWorkTypes = [
  WorkType.ANIME,
  WorkType.OVA,
  WorkType.MOVIE,
  WorkType.SPECIAL,
] as const;

export const mangaDetailsSchema = z.object({
  chapterCount: z.coerce.number().int().nonnegative().optional(),
  volumeCount: z.coerce.number().int().nonnegative().optional(),
});

export const animeDetailsSchema = z.object({
  episodeCount: z.coerce.number().int().nonnegative().optional(),
  durationMinutes: z.coerce.number().int().positive().optional(),
  season: z.string().max(50).optional(),
  seasonYear: z.coerce.number().int().min(1900).max(3000).optional(),
});

export const workSchemaBase = z.object({
  title: z.string().min(1).max(255),
  nativeTitle: z.string().max(255).optional(),
  englishTitle: z.string().max(255).optional(),
  alternativeTitles: z.preprocess(
    (v) =>
      typeof v === 'string'
        ? v
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : v,
    z.array(z.string()).optional(),
  ),
  description: z.string().optional(),
  coverUrl: z.string().max(500).optional(),
  bannerUrl: z.string().max(500).optional(),
  type: z.enum(WorkType),
  demographic: z.string().max(50).optional(),
  contentRating: z.string().max(50).optional(),
  visibilityStatus: z.enum(VisibilityStatus).default(VisibilityStatus.PRIVATE),
  publicationStatus: z.enum(PublicationStatus).default(PublicationStatus.DRAFT),
  moderationStatus: z.enum(ModerationStatus).default(ModerationStatus.OK),
  startYear: z.coerce.number().int().min(1900).max(3000).optional(),
  endYear: z.coerce.number().int().min(1900).max(3000).optional(),
  featuredWeight: z.coerce.number().int().default(0).optional(),
  mangaDetails: mangaDetailsSchema.optional(),
  animeDetails: animeDetailsSchema.optional(),
  tagIds: z.preprocess((v) => (typeof v === 'string' ? [v] : v), z.array(z.uuid()).optional()),
});

type WorkDetailsInput = {
  type?: WorkType;
  mangaDetails?: unknown;
  animeDetails?: unknown;
};

export function validateWorkDetails(input: WorkDetailsInput, ctx: z.RefinementCtx): void {
  if (input.type && mangaWorkTypes.includes(input.type as (typeof mangaWorkTypes)[number]) && input.animeDetails) {
    ctx.addIssue({
      code: 'custom',
      path: ['animeDetails'],
      message: 'animeDetails is only valid for anime work types',
    });
  }

  if (input.type && animeWorkTypes.includes(input.type as (typeof animeWorkTypes)[number]) && input.mangaDetails) {
    ctx.addIssue({
      code: 'custom',
      path: ['mangaDetails'],
      message: 'mangaDetails is only valid for manga work types',
    });
  }

  if (!input.type && input.mangaDetails && input.animeDetails) {
    ctx.addIssue({
      code: 'custom',
      path: ['type'],
      message: 'type is required when sending both mangaDetails and animeDetails',
    });
  }
}

export const createWorkSchema = workSchemaBase.superRefine(validateWorkDetails);

export type CreateWorkInput = z.infer<typeof createWorkSchema>;
