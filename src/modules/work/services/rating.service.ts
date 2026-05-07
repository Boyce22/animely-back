import { Logger } from 'pino';

import { RatingRepository } from '@/modules/work/repositories/rating.repository';
import { WorkRepository } from '@/modules/work/repositories/work.repository';
import { CreateRatingInput, PatchRatingInput, QueryRatingsInput } from '@/modules/work/schemas';
import { RatingResponse } from '@/modules/work/dtos/rating-response.dto';
import { Rating } from '@/modules/work/entities/rating.entity';

import { PaginatedResponse } from '@/shared/interfaces/api-response.interface';
import { Roles } from '@/shared/security';
import { ConflictError, ForbiddenError, NotFoundError } from '@errors';

export class RatingService {
  constructor(
    private readonly ratingRepository: RatingRepository,
    private readonly workRepository: WorkRepository,
    private readonly logger: Logger,
  ) {}

  async getRatings(query: QueryRatingsInput): Promise<PaginatedResponse<RatingResponse>> {
    const { workId, page, limit } = query;

    const { data, total } = await this.ratingRepository.findByWork(workId, page, limit);

    return {
      items: data.map(toRatingResponse),
      pagination: {
        type: 'offset',
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserRating(userId: string, workId: string): Promise<RatingResponse | null> {
    const rating = await this.ratingRepository.findByUserAndWork(userId, workId);
    return rating ? toRatingResponse(rating) : null;
  }

  async createRating(input: CreateRatingInput, userId: string): Promise<RatingResponse> {
    const work = await this.workRepository.findById(input.workId);
    if (!work) throw new NotFoundError('Work not found');

    const existing = await this.ratingRepository.findByUserAndWork(userId, input.workId);
    if (existing) throw new ConflictError('You already rated this work');

    const rating = await this.ratingRepository.create(userId, input.workId, input.score, input.review);
    await this.workRepository.increment(input.workId, 'ratingCount', 1);
    await this.updateWorkAverage(input.workId);

    this.logger.info({ ratingId: rating.id, workId: input.workId }, 'Rating created');
    return toRatingResponse(rating);
  }

  async patchRating(id: string, input: PatchRatingInput, userId: string, userRole: Roles): Promise<RatingResponse> {
    const rating = await this.ratingRepository.findById(id);
    if (!rating) throw new NotFoundError('Rating not found');

    const isPrivileged = userRole === Roles.ADMIN || userRole === Roles.OWNER;
    if (rating.userId !== userId && !isPrivileged) {
      throw new ForbiddenError('You can only edit your own ratings');
    }

    const updated = await this.ratingRepository.patch(id, input);
    await this.updateWorkAverage(rating.workId);

    this.logger.info({ ratingId: id }, 'Rating patched');
    return toRatingResponse(updated);
  }

  async deleteRating(id: string, userId: string, userRole: Roles): Promise<void> {
    const rating = await this.ratingRepository.findById(id);
    if (!rating) throw new NotFoundError('Rating not found');

    const isPrivileged = userRole === Roles.ADMIN || userRole === Roles.OWNER;
    if (rating.userId !== userId && !isPrivileged) {
      throw new ForbiddenError('You can only delete your own ratings');
    }

    await this.ratingRepository.delete(id);
    await this.workRepository.decrement(rating.workId, 'ratingCount', 1);
    await this.updateWorkAverage(rating.workId);

    this.logger.info({ ratingId: id }, 'Rating deleted');
  }

  private async updateWorkAverage(workId: string): Promise<void> {
    const avg = await this.ratingRepository.getAverageScore(workId);
    await this.workRepository.updateAverageRating(workId, avg);
  }
}

function toRatingResponse(rating: Rating): RatingResponse {
  return {
    id: rating.id,
    score: Number(rating.score),
    review: rating.review,
    workId: rating.workId,
    userId: rating.userId,
    createdAt: rating.createdAt.toISOString(),
    updatedAt: rating.updatedAt.toISOString(),
  };
}
