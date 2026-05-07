import { Request, Response, Router } from 'express';

import { RatingService } from '@/modules/work/services/rating.service';
import { createRatingSchema, patchRatingSchema, queryRatingsSchema } from '@/modules/work/schemas';

import { authenticate } from '@/modules/auth/jwt.middleware';
import { asyncHandler, validateDto } from '@utils';
import { AuthenticatedRequest } from '@/shared/types/authenticated-request';

export class RatingController {
  public router: Router;
  private ratingService: RatingService;

  constructor(ratingService: RatingService) {
    this.router = Router();
    this.ratingService = ratingService;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/', asyncHandler(this.getRatings));
    this.router.get('/me/:workId', authenticate, asyncHandler(this.getUserRating));
    this.router.post('/', authenticate, asyncHandler(this.createRating));
    this.router.patch('/:id', authenticate, asyncHandler(this.patchRating));
    this.router.delete('/:id', authenticate, asyncHandler(this.deleteRating));
  }

  private getRatings = async (req: Request, res: Response): Promise<void> => {
    const query = validateDto(queryRatingsSchema, req.query);
    const result = await this.ratingService.getRatings(query);
    res.json({ data: result });
  };

  private getUserRating = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await this.ratingService.getUserRating(req.user.id, req.params['workId'] as string);
    res.json({ data: result });
  };

  private createRating = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const data = validateDto(createRatingSchema, req.body);
    const rating = await this.ratingService.createRating(data, req.user.id);
    res.status(201).json({ data: rating });
  };

  private patchRating = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const data = validateDto(patchRatingSchema, req.body);
    const rating = await this.ratingService.patchRating(req.params['id'] as string, data, req.user.id, req.user.role);
    res.json({ data: rating });
  };

  private deleteRating = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    await this.ratingService.deleteRating(req.params['id'] as string, req.user.id, req.user.role);
    res.status(204).send();
  };
}
