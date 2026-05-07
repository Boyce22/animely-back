import { In, Repository } from 'typeorm';
import { Work } from '@/modules/work/entities/work.entity';
import { Tag } from '@/modules/work/entities/tag.entity';
import { AnimeDetails } from '@/modules/work/entities/anime-details.entity';
import { MangaDetails } from '@/modules/work/entities/manga-details.entity';
import { WorkType } from '@/modules/work/enums/work-type';
import { CreateWorkInput, PatchWorkInput, QueryWorksInput } from '@/modules/work/schemas';
import { NotFoundError } from '@errors';
import { VisibilityStatus } from '@/shared/enums/visibility-status';
import { ModerationStatus } from '@/shared/enums/moderation-status';

type WorkCounterField = 'commentCount' | 'ratingCount' | 'favoriteCount';

const workRelations = ['tags', 'mangaDetails', 'animeDetails'];

export class WorkRepository {
  constructor(
    private readonly repository: Repository<Work>,
    private readonly tagRepository: Repository<Tag>,
  ) {}

  async findById(id: string): Promise<Work | null> {
    return this.repository.findOne({ where: { id }, relations: workRelations });
  }

  async findHero(limit = 5): Promise<Work[]> {
    return this.repository
      .createQueryBuilder('work')
      .leftJoinAndSelect('work.tags', 'tag')
      .leftJoinAndSelect('work.mangaDetails', 'mangaDetails')
      .leftJoinAndSelect('work.animeDetails', 'animeDetails')
      .where('work.featuredWeight > 0')
      .andWhere('work.visibilityStatus = :visibilityStatus', { visibilityStatus: VisibilityStatus.PUBLIC })
      .andWhere('work.deletedAt IS NULL')
      .orderBy('work.featuredWeight', 'DESC')
      .addOrderBy('work.updatedAt', 'DESC')
      .take(limit)
      .getMany();
  }

  async findSpecial(limit = 6, _userId?: string): Promise<Work[]> {
    return this.repository
      .createQueryBuilder('work')
      .leftJoinAndSelect('work.tags', 'tag')
      .leftJoinAndSelect('work.mangaDetails', 'mangaDetails')
      .leftJoinAndSelect('work.animeDetails', 'animeDetails')
      .where('work.deletedAt IS NULL')
      .andWhere('work.visibilityStatus = :visibilityStatus', { visibilityStatus: VisibilityStatus.PUBLIC })
      .orderBy('work.bayesianScore', 'DESC')
      .addOrderBy('work.averageRating', 'DESC')
      .take(limit)
      .getMany();
  }

  async findTrending(limit = 7): Promise<Work[]> {
    return this.repository
      .createQueryBuilder('work')
      .leftJoinAndSelect('work.tags', 'tag')
      .leftJoinAndSelect('work.mangaDetails', 'mangaDetails')
      .leftJoinAndSelect('work.animeDetails', 'animeDetails')
      .where('work.deletedAt IS NULL')
      .andWhere('work.visibilityStatus = :visibilityStatus', { visibilityStatus: VisibilityStatus.PUBLIC })
      .orderBy('work.popularityScore', 'DESC')
      .addOrderBy('work.favoriteCount', 'DESC')
      .take(limit)
      .getMany();
  }

  async findPopular(limit = 16): Promise<Work[]> {
    return this.repository
      .createQueryBuilder('work')
      .leftJoinAndSelect('work.tags', 'tag')
      .leftJoinAndSelect('work.mangaDetails', 'mangaDetails')
      .leftJoinAndSelect('work.animeDetails', 'animeDetails')
      .where('work.deletedAt IS NULL')
      .andWhere('work.visibilityStatus = :visibilityStatus', { visibilityStatus: VisibilityStatus.PUBLIC })
      .orderBy('work.popularityScore', 'DESC')
      .addOrderBy('work.favoriteCount', 'DESC')
      .take(limit)
      .getMany();
  }

  async findBySlug(slug: string): Promise<Work | null> {
    return this.repository.findOne({ where: { slug }, relations: workRelations });
  }

  async findAllPaginated(query: QueryWorksInput): Promise<{ data: Work[]; total: number }> {
    const { page, limit } = query;

    const qb = this.repository
      .createQueryBuilder('work')
      .leftJoinAndSelect('work.tags', 'tag')
      .leftJoinAndSelect('work.mangaDetails', 'mangaDetails')
      .leftJoinAndSelect('work.animeDetails', 'animeDetails');

    const title = query.title ?? query.search;
    if (title) {
      qb.andWhere(
        '(work.title ILIKE :title OR work.nativeTitle ILIKE :title OR work.englishTitle ILIKE :title OR work.description ILIKE :title)',
        { title: `%${title}%` },
      );
    }

    qb.andWhere('work.visibilityStatus = :visibilityStatus', {
      visibilityStatus: query.visibilityStatus ?? VisibilityStatus.PUBLIC,
    });

    if (query.type) qb.andWhere('work.type = :type', { type: query.type });
    if (query.demographic) qb.andWhere('work.demographic = :demographic', { demographic: query.demographic });
    if (query.contentRating) qb.andWhere('work.contentRating = :contentRating', { contentRating: query.contentRating });
    if (query.publicationStatus) {
      qb.andWhere('work.publicationStatus = :publicationStatus', { publicationStatus: query.publicationStatus });
    }
    if (query.moderationStatus) {
      qb.andWhere('work.moderationStatus = :moderationStatus', { moderationStatus: query.moderationStatus });
    }
    if (query.startYear !== undefined) qb.andWhere('work.startYear >= :startYear', { startYear: query.startYear });
    if (query.endYear !== undefined) qb.andWhere('work.endYear <= :endYear', { endYear: query.endYear });
    if (query.minRating !== undefined) qb.andWhere('work.averageRating >= :minRating', { minRating: query.minRating });
    if (query.tags?.length) {
      qb.andWhere('(tag.id IN (:...tags) OR tag.slug IN (:...tags) OR tag.name IN (:...tags))', { tags: query.tags });
    }

    qb.orderBy(`work.${query.sortBy}`, query.order);
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async create(input: CreateWorkInput & { slug: string; createdById?: string; coverUrl: string }): Promise<Work> {
    const { tagIds, mangaDetails, animeDetails, ...data } = input;
    const work = this.repository.create(data as Partial<Work>);

    if (tagIds?.length) {
      work.tags = await this.tagRepository.find({ where: { id: In(tagIds) } });
    } else {
      work.tags = [];
    }

    if (mangaDetails) work.mangaDetails = { ...mangaDetails, workId: work.id, work } as Work['mangaDetails'];
    if (animeDetails) work.animeDetails = { ...animeDetails, workId: work.id, work } as Work['animeDetails'];

    await this.repository.save(work);
    return (await this.findById(work.id))!;
  }

  async patch(
    id: string,
    input: PatchWorkInput & { slug?: string; updatedById?: string; coverUrl?: string; bannerUrl?: string },
  ): Promise<Work> {
    const work = await this.findByIdOrFail(id);
    const { tagIds, mangaDetails, animeDetails, ...data } = input;

    const filtered = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
    Object.assign(work, filtered);

    if (tagIds !== undefined) {
      work.tags = tagIds.length ? await this.tagRepository.find({ where: { id: In(tagIds) } }) : [];
    }

    if (mangaDetails !== undefined) {
      work.mangaDetails = { ...(work.mangaDetails ?? {}), ...mangaDetails, workId: work.id, work } as Work['mangaDetails'];
    }

    if (animeDetails !== undefined) {
      work.animeDetails = { ...(work.animeDetails ?? {}), ...animeDetails, workId: work.id, work } as Work['animeDetails'];
    }

    if (input.type && isMangaWorkType(input.type)) {
      await this.repository.manager.delete(AnimeDetails, { workId: work.id });
      work.animeDetails = undefined;
    }

    if (input.type && isAnimeWorkType(input.type)) {
      await this.repository.manager.delete(MangaDetails, { workId: work.id });
      work.mangaDetails = undefined;
    }

    await this.repository.save(work);
    return (await this.findById(id))!;
  }

  async softDelete(id: string): Promise<void> {
    await this.findByIdOrFail(id);
    await this.repository.update(id, {
      deletedAt: new Date(),
      visibilityStatus: VisibilityStatus.PRIVATE,
      moderationStatus: ModerationStatus.DELETED,
    });
  }

  async updateCover(id: string, coverUrl: string): Promise<void> {
    await this.repository.update(id, { coverUrl });
  }

  async updateBanner(id: string, bannerUrl: string): Promise<void> {
    await this.repository.update(id, { bannerUrl });
  }

  async increment(id: string, field: WorkCounterField, value: number): Promise<void> {
    await this.repository.increment({ id }, field, value);
  }

  async decrement(id: string, field: WorkCounterField, value: number): Promise<void> {
    await this.repository.decrement({ id }, field, value);
  }

  async updateAverageRating(id: string, averageRating: number): Promise<void> {
    await this.repository.update(id, { averageRating });
  }

  async slugExists(slug: string): Promise<boolean> {
    const count = await this.repository.count({ where: { slug } });
    return count > 0;
  }

  private async findByIdOrFail(id: string): Promise<Work> {
    const work = await this.repository.findOne({ where: { id }, relations: workRelations });
    if (!work) throw new NotFoundError('Work not found');
    return work;
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
