import path from 'path';
import { Logger } from 'pino';

import { WorkRepository } from '@/modules/work/repositories/work.repository';
import { CreateWorkInput, PatchWorkInput, QueryWorksInput } from '@/modules/work/schemas';
import { WorkResponse, TagResponse } from '@/modules/work/dtos/work-response.dto';
import { Work } from '@/modules/work/entities/work.entity';
import { Tag } from '@/modules/work/entities/tag.entity';
import { WorkType } from '@/modules/work/enums/work-type';

import { PaginatedResponse } from '@/shared/interfaces/api-response.interface';
import { getStorageProvider, signStorageUrl } from '@/shared/storage/storage.factory';

import { BadRequestError, NotFoundError } from '@errors';
import { Collection } from '@/modules/work/entities/collection.entity';
import { CollectionRepository } from '@/modules/work/repositories/collection.repository';
import { CollectionDto, HeroWorkDto, HomePageDto, WorkCardDto } from '@/modules/work/dtos/home-page.dto';

export class WorkService {
  constructor(
    private readonly workRepository: WorkRepository,
    private readonly collectionRepository: CollectionRepository,
    private readonly logger: Logger,
  ) {}

  async getPersonalizedHome(userId?: string): Promise<HomePageDto> {
    const [hero, special, trending, popular, collections] = await Promise.all([
      this.workRepository.findHero(),
      this.workRepository.findSpecial(6, userId),
      this.workRepository.findTrending(),
      this.workRepository.findPopular(),
      this.collectionRepository.findFeatured(),
    ]);

    const [signedHero, signedSpecial, signedTrending, signedPopular, signedCollections] = await Promise.all([
      Promise.all(hero.map(signHero)),
      Promise.all(special.map(signCard)),
      Promise.all(trending.map(signCard)),
      Promise.all(popular.map(signCard)),
      Promise.all(collections.map(signCollection)),
    ]);

    return {
      hero: signedHero,
      specialForYou: signedSpecial,
      trending: signedTrending,
      popular: { items: signedPopular, total: popular.length },
      collections: signedCollections,
    };
  }

  async getWorks(query: QueryWorksInput): Promise<PaginatedResponse<WorkResponse>> {
    const { data, total } = await this.workRepository.findAllPaginated(query);
    const { page, limit } = query;

    return {
      items: await Promise.all(data.map(signWorkResponse)),
      pagination: {
        type: 'offset',
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getWorkBySlug(slug: string): Promise<WorkResponse> {
    const work = await this.workRepository.findBySlug(slug);
    if (!work) throw new NotFoundError('Work not found');
    return signWorkResponse(work);
  }

  async getWorkById(id: string): Promise<WorkResponse> {
    const work = await this.workRepository.findById(id);
    if (!work) throw new NotFoundError('Work not found');
    return signWorkResponse(work);
  }

  async createWork(input: CreateWorkInput, createdById?: string): Promise<WorkResponse> {
    this.assertRequiredDetails(input);
    const slug = await this.generateUniqueSlug(input.title);

    const work = await this.workRepository.create({
      ...input,
      slug,
      createdById,
      coverUrl: input.coverUrl ?? '',
    });

    this.logger.info({ workId: work.id }, 'Work created');
    return signWorkResponse(work);
  }

  async patchWork(id: string, input: PatchWorkInput, updatedById?: string): Promise<WorkResponse> {
    const existing = await this.workRepository.findById(id);
    if (!existing) throw new NotFoundError('Work not found');
    this.assertRequiredDetails(input, existing);

    const patchData: PatchWorkInput & { slug?: string; updatedById?: string } = {
      ...input,
      updatedById,
    };

    if (input.title && input.title !== existing.title) {
      patchData.slug = await this.generateUniqueSlug(input.title);
    }

    const work = await this.workRepository.patch(id, patchData);
    this.logger.info({ workId: id }, 'Work patched');
    return signWorkResponse(work);
  }

  async deleteWork(id: string): Promise<void> {
    const work = await this.workRepository.findById(id);
    if (!work) throw new NotFoundError('Work not found');
    await this.workRepository.softDelete(id);
    this.logger.info({ workId: id }, 'Work deleted');
  }

  async uploadCover(id: string, file: Express.Multer.File): Promise<string> {
    const work = await this.workRepository.findById(id);
    if (!work) throw new NotFoundError('Work not found');

    const storage = getStorageProvider();
    const result = await storage.upload(file.buffer, {
      folder: `works/${id}/cover`,
      filename: `${Date.now()}${path.extname(file.originalname)}`,
      maxWidth: 800,
      maxHeight: 1200,
      quality: 90,
    });

    await this.workRepository.updateCover(id, result.url);
    this.logger.info({ workId: id, url: result.url }, 'Work cover updated');
    return (await signStorageUrl(result.url)) ?? result.url;
  }

  async uploadBanner(id: string, file: Express.Multer.File): Promise<string> {
    const work = await this.workRepository.findById(id);
    if (!work) throw new NotFoundError('Work not found');

    const storage = getStorageProvider();
    const result = await storage.upload(file.buffer, {
      folder: `works/${id}/banner`,
      filename: `${Date.now()}${path.extname(file.originalname)}`,
      maxWidth: 2560,
      maxHeight: 720,
      quality: 90,
    });

    await this.workRepository.updateBanner(id, result.url);
    this.logger.info({ workId: id, url: result.url }, 'Work banner updated');
    return (await signStorageUrl(result.url)) ?? result.url;
  }

  private async generateUniqueSlug(title: string): Promise<string> {
    const base = slugify(title);
    let slug = base;
    let attempt = 0;

    while (await this.workRepository.slugExists(slug)) {
      attempt++;
      slug = `${base}-${attempt}`;
    }

    return slug;
  }

  private assertRequiredDetails(input: CreateWorkInput | PatchWorkInput, existing?: Work): void {
    const type = input.type ?? existing?.type;
    const hasMangaDetails = input.mangaDetails !== undefined || existing?.mangaDetails !== undefined;
    const hasAnimeDetails = input.animeDetails !== undefined || existing?.animeDetails !== undefined;

    if (!type) return;

    if (isMangaWorkType(type)) {
      if (!hasMangaDetails) {
        throw new BadRequestError('mangaDetails is required for manga work types');
      }
      if (input.animeDetails !== undefined) {
        throw new BadRequestError('animeDetails is only valid for anime work types');
      }
    }

    if (isAnimeWorkType(type)) {
      if (!hasAnimeDetails) {
        throw new BadRequestError('animeDetails is required for anime work types');
      }
      if (input.mangaDetails !== undefined) {
        throw new BadRequestError('mangaDetails is only valid for manga work types');
      }
    }
  }
}

function isMangaWorkType(type: WorkType): boolean {
  return [
    WorkType.MANGA,
    WorkType.MANHWA,
    WorkType.MANHUA,
    WorkType.NOVEL,
    WorkType.ONE_SHOT,
  ].includes(type);
}

function isAnimeWorkType(type: WorkType): boolean {
  return [WorkType.ANIME, WorkType.OVA, WorkType.MOVIE, WorkType.SPECIAL].includes(type);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toTagResponse(tag: Tag): TagResponse {
  return {
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    type: tag.type,
    color: tag.color,
  };
}

export function toWorkResponse(work: Work): WorkResponse {
  return {
    id: work.id,
    title: work.title,
    nativeTitle: work.nativeTitle,
    englishTitle: work.englishTitle,
    alternativeTitles: work.alternativeTitles,
    slug: work.slug,
    description: work.description,
    coverUrl: work.coverUrl,
    bannerUrl: work.bannerUrl,
    type: work.type,
    demographic: work.demographic,
    contentRating: work.contentRating,
    visibilityStatus: work.visibilityStatus,
    publicationStatus: work.publicationStatus,
    moderationStatus: work.moderationStatus,
    startYear: work.startYear,
    endYear: work.endYear,
    averageRating: Number(work.averageRating),
    ratingCount: work.ratingCount,
    ratingDistribution: work.ratingDistribution,
    bayesianScore: Number(work.bayesianScore),
    favoriteCount: work.favoriteCount,
    commentCount: work.commentCount,
    planToReadCount: work.planToReadCount,
    readingCount: work.readingCount,
    completedCount: work.completedCount,
    onHoldCount: work.onHoldCount,
    droppedCount: work.droppedCount,
    popularityScore: Number(work.popularityScore),
    popularityRank: work.popularityRank,
    scoreRank: work.scoreRank,
    featuredWeight: work.featuredWeight,
    mangaDetails: work.mangaDetails
      ? {
          chapterCount: work.mangaDetails.chapterCount,
          volumeCount: work.mangaDetails.volumeCount,
        }
      : undefined,
    animeDetails: work.animeDetails
      ? {
          episodeCount: work.animeDetails.episodeCount,
          durationMinutes: work.animeDetails.durationMinutes,
          season: work.animeDetails.season,
          seasonYear: work.animeDetails.seasonYear,
        }
      : undefined,
    tags: (work.tags ?? []).map(toTagResponse),
    createdAt: work.createdAt.toISOString(),
    updatedAt: work.updatedAt.toISOString(),
  };
}

async function signWorkResponse(work: Work): Promise<WorkResponse> {
  const resp = toWorkResponse(work);
  resp.coverUrl = (await signStorageUrl(resp.coverUrl)) ?? resp.coverUrl;
  resp.bannerUrl = (await signStorageUrl(resp.bannerUrl)) ?? resp.bannerUrl;
  return resp;
}

async function signHero(work: Work): Promise<HeroWorkDto> {
  return {
    id: work.id,
    title: work.title,
    slug: work.slug,
    description: work.description,
    coverUrl: (await signStorageUrl(work.coverUrl)) ?? work.coverUrl,
    bannerUrl: (await signStorageUrl(work.bannerUrl)) ?? work.bannerUrl,
    type: work.type,
    contentRating: work.contentRating,
    tags: (work.tags ?? []).map(toTagResponse),
  };
}

async function signCard(work: Work): Promise<WorkCardDto> {
  return {
    id: work.id,
    title: work.title,
    slug: work.slug,
    coverUrl: (await signStorageUrl(work.coverUrl)) ?? work.coverUrl,
    type: work.type,
    publicationStatus: work.publicationStatus,
    averageRating: Number(work.averageRating),
    bayesianScore: Number(work.bayesianScore),
    startYear: work.startYear,
    contentRating: work.contentRating,
    tags: (work.tags ?? []).map(toTagResponse),
  };
}

async function signCollection(c: Collection): Promise<CollectionDto> {
  return {
    id: c.id,
    title: c.name,
    description: c.description ?? null,
    coverUrl: (await signStorageUrl(c.coverUrl)) ?? c.coverUrl ?? null,
    works: await Promise.all(
      (c.entries ?? []).map(async (e) => ({
        id: e.work.id,
        coverUrl: (await signStorageUrl(e.work.coverUrl)) ?? e.work.coverUrl,
      })),
    ),
  };
}
