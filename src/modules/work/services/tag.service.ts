import { Logger } from 'pino';
import { TagRepository } from '@/modules/work/repositories/tag.repository';
import { CreateTagInput, PatchTagInput, QueryTagsInput } from '@/modules/work/schemas';
import { TagResponse } from '@/modules/work/dtos/work-response.dto';
import { Tag } from '@/modules/work/entities/tag.entity';
import { PaginatedResponse } from '@/shared/interfaces/api-response.interface';
import { ConflictError, NotFoundError } from '@errors';

export class TagService {
  constructor(
    private readonly tagRepository: TagRepository,
    private readonly logger: Logger,
  ) {}

  async getTags(query: QueryTagsInput): Promise<PaginatedResponse<TagResponse>> {
    const { data, total } = await this.tagRepository.findAllPaginated(query);

    const { page, limit } = query;

    return {
      items: data.map(toTagResponse),
      pagination: {
        type: 'offset',
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTagById(id: string): Promise<TagResponse> {
    const tag = await this.tagRepository.findById(id);
    if (!tag) throw new NotFoundError('Tag not found');
    return toTagResponse(tag);
  }

  async createTag(input: CreateTagInput, createdById?: string): Promise<TagResponse> {
    const existing = await this.tagRepository.findByName(input.name);
    if (existing) throw new ConflictError('Tag name already exists');

    const slug = await this.generateUniqueSlug(input.name);
    const tag = await this.tagRepository.create({ ...input, slug, createdById });

    this.logger.info({ tagId: tag.id }, 'Tag created');
    return toTagResponse(tag);
  }

  async patchTag(id: string, input: PatchTagInput, updatedById?: string): Promise<TagResponse> {
    const existing = await this.tagRepository.findById(id);
    if (!existing) throw new NotFoundError('Tag not found');

    const patchData: PatchTagInput & { slug?: string; updatedById?: string } = {
      ...input,
      updatedById,
    };

    if (input.name && input.name !== existing.name) {
      const nameConflict = await this.tagRepository.findByName(input.name);
      if (nameConflict) throw new ConflictError('Tag name already exists');
      patchData.slug = await this.generateUniqueSlug(input.name);
    }

    const tag = await this.tagRepository.patch(id, patchData);
    this.logger.info({ tagId: id }, 'Tag patched');
    return toTagResponse(tag);
  }

  async deleteTag(id: string): Promise<void> {
    const tag = await this.tagRepository.findById(id);
    if (!tag) throw new NotFoundError('Tag not found');
    await this.tagRepository.softDelete(id);
    this.logger.info({ tagId: id }, 'Tag deleted');
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    const base = slugify(name);
    let slug = base;
    let attempt = 0;
    while (await this.tagRepository.slugExists(slug)) {
      attempt++;
      slug = `${base}-${attempt}`;
    }
    return slug;
  }
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

export function toTagResponse(tag: Tag): TagResponse {
  return {
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    type: tag.type,
    color: tag.color,
  };
}
