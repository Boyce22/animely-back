import { Repository } from 'typeorm';
import { Rating } from '@/modules/work/entities/rating.entity';
import { PatchRatingInput } from '@/modules/work/schemas';
import { NotFoundError } from '@errors';

export class RatingRepository {
  constructor(private readonly repository: Repository<Rating>) {}

  async findById(id: string): Promise<Rating | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByUserAndWork(userId: string, workId: string): Promise<Rating | null> {
    return this.repository.findOne({ where: { userId, workId } });
  }

  async findByWork(workId: string, page: number, limit: number): Promise<{ data: Rating[]; total: number }> {
    const [data, total] = await this.repository.findAndCount({
      where: { workId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  async create(userId: string, workId: string, score: number, review?: string): Promise<Rating> {
    const rating = this.repository.create({ userId, workId, score, review });
    await this.repository.save(rating);
    return rating;
  }

  async patch(id: string, input: PatchRatingInput): Promise<Rating> {
    const rating = await this.findByIdOrFail(id);
    const filtered = Object.fromEntries(Object.entries(input).filter(([_, v]) => v !== undefined));
    Object.assign(rating, filtered);
    await this.repository.save(rating);
    return rating;
  }

  async delete(id: string): Promise<void> {
    await this.findByIdOrFail(id);
    await this.repository.delete(id);
  }

  async getAverageScore(workId: string): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('rating')
      .select('AVG(rating.score)', 'avg')
      .where('rating.workId = :workId', { workId })
      .getRawOne();
    return parseFloat(result?.avg ?? '0');
  }

  private async findByIdOrFail(id: string): Promise<Rating> {
    const rating = await this.findById(id);
    if (!rating) throw new NotFoundError('Rating not found');
    return rating;
  }
}
