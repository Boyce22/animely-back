import { Repository } from 'typeorm';
import { Collection } from '@/modules/work/entities/collection.entity';
import { VisibilityStatus } from '@/shared/enums/visibility-status';

export class CollectionRepository {
  constructor(private readonly repository: Repository<Collection>) {}

  async findFeatured(limit = 4, entryLimit = 8): Promise<Collection[]> {
    const collections = await this.repository
      .createQueryBuilder('c')
      .select(['c.id', 'c.name', 'c.description', 'c.coverUrl', 'c.updatedAt'])
      .leftJoin('c.entries', 'e')
      .addSelect(['e.id'])
      .leftJoin('e.work', 'w')
      .addSelect(['w.id', 'w.coverUrl'])
      .where('c.isPublic = true')
      .andWhere('c.isFeatured = true')
      .andWhere('c.deletedAt IS NULL')
      .andWhere('w.visibilityStatus = :visibilityStatus', { visibilityStatus: VisibilityStatus.PUBLIC })
      .orderBy('c.updatedAt', 'DESC')
      .take(limit)
      .getMany();

    return collections.map((c) => ({ ...c, entries: (c.entries ?? []).slice(0, entryLimit) }));
  }
}
