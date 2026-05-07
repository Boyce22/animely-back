import { Repository } from 'typeorm';
import { Tag } from '@/modules/work/entities/tag.entity';
import { CreateTagInput, PatchTagInput, QueryTagsInput } from '@/modules/work/schemas';
import { NotFoundError } from '@errors';

export class TagRepository {
  constructor(private readonly repository: Repository<Tag>) {}

  async findById(id: string): Promise<Tag | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByName(name: string): Promise<Tag | null> {
    return this.repository.findOne({ where: { name } });
  }

  async findBySlug(slug: string): Promise<Tag | null> {
    return this.repository.findOne({ where: { slug } });
  }

  async findAllPaginated(query: QueryTagsInput): Promise<{ data: Tag[]; total: number }> {
    const { page, limit } = query;

    const qb = this.repository.createQueryBuilder('tag');

    if (query.search) {
      qb.andWhere('(tag.name ILIKE :search OR tag.description ILIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    if (query.type) {
      qb.andWhere('tag.type = :type', { type: query.type });
    }

    qb.orderBy('tag.name', query.order);
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async create(input: CreateTagInput & { slug: string; createdById?: string }): Promise<Tag> {
    const tag = this.repository.create(input as Partial<Tag>);
    await this.repository.save(tag);
    return (await this.findById(tag.id))!;
  }

  async patch(id: string, input: PatchTagInput & { slug?: string; updatedById?: string }): Promise<Tag> {
    const tag = await this.findByIdOrFail(id);
    const filtered = Object.fromEntries(Object.entries(input).filter(([_, v]) => v !== undefined));
    Object.assign(tag, filtered);
    await this.repository.save(tag);
    return tag;
  }

  async softDelete(id: string): Promise<void> {
    await this.findByIdOrFail(id);
    await this.repository.softDelete(id);
  }

  async slugExists(slug: string): Promise<boolean> {
    const count = await this.repository.count({ where: { slug } });
    return count > 0;
  }

  private async findByIdOrFail(id: string): Promise<Tag> {
    const tag = await this.findById(id);
    if (!tag) throw new NotFoundError('Tag not found');
    return tag;
  }
}
