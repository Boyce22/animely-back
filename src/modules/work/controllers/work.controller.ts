import { Request, Response, Router } from 'express';

import { WorkService } from '@/modules/work/services/work.service';
import { createWorkSchema, patchWorkSchema, queryWorksSchema } from '@/modules/work/schemas';

import { authenticate, authorize } from '@/modules/auth/jwt.middleware';
import { Roles } from '@/shared/security';
import { asyncHandler, validateDto } from '@utils';
import { BadRequestError } from '@errors';
import { AuthenticatedRequest } from '@/shared/types/authenticated-request';
import { UPLOAD_MIDDLEWARE } from '@/shared/storage/upload/upload.config';

export class WorkController {
  public router: Router;

  constructor(private readonly workService: WorkService) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/', asyncHandler(this.getWorks));
    this.router.get('/home', asyncHandler(this.getPersonalizedHome));
    this.router.get('/:slug', asyncHandler(this.getWorkBySlug));

    this.router.post('/', authenticate, authorize(Roles.ADMIN, Roles.MODERATOR), asyncHandler(this.createWork));
    this.router.patch('/:id', authenticate, authorize(Roles.ADMIN, Roles.MODERATOR), asyncHandler(this.patchWork));

    this.router.post(
      '/:id/cover',
      authenticate,
      authorize(Roles.ADMIN, Roles.MODERATOR),
      UPLOAD_MIDDLEWARE.MANGA_COVER,
      asyncHandler(this.uploadCover),
    );

    this.router.post(
      '/:id/banner',
      authenticate,
      authorize(Roles.ADMIN, Roles.MODERATOR),
      UPLOAD_MIDDLEWARE.BANNER,
      asyncHandler(this.uploadBanner),
    );

    this.router.delete('/:id', authenticate, authorize(Roles.ADMIN), asyncHandler(this.deleteWork));
  }

  private getPersonalizedHome = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await this.workService.getPersonalizedHome();
    res.json({ data: result });
  };

  private getWorks = async (req: Request, res: Response): Promise<void> => {
    const query = validateDto(queryWorksSchema, req.query);
    const result = await this.workService.getWorks(query);
    res.json({ data: result });
  };

  private getWorkBySlug = async (req: Request, res: Response): Promise<void> => {
    const work = await this.workService.getWorkBySlug(req.params['slug'] as string);
    res.json({ data: work });
  };

  private createWork = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const data = validateDto(createWorkSchema, req.body);
    const work = await this.workService.createWork(data, req.user.id);
    res.status(201).json({ data: work });
  };

  private patchWork = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const data = validateDto(patchWorkSchema, req.body);
    const work = await this.workService.patchWork(req.params['id'] as string, data, req.user.id);
    res.json({ data: work });
  };

  private deleteWork = async (req: Request, res: Response): Promise<void> => {
    await this.workService.deleteWork(req.params['id'] as string);
    res.status(204).send();
  };

  private uploadCover = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.file) throw new BadRequestError('No file provided');
    const coverUrl = await this.workService.uploadCover(req.params['id'] as string, req.file);
    res.json({ data: { coverUrl } });
  };

  private uploadBanner = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.file) throw new BadRequestError('No file provided');
    const bannerUrl = await this.workService.uploadBanner(req.params['id'] as string, req.file);
    res.json({ data: { bannerUrl } });
  };
}
