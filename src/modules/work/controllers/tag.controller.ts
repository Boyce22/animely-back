import { Request, Response, Router } from 'express';
import { TagService } from '@/modules/work/services/tag.service';
import { createTagSchema, patchTagSchema, queryTagsSchema } from '@/modules/work/schemas';
import { authenticate, authorize } from '@/modules/auth/jwt.middleware';
import { Roles } from '@/shared/security';
import { asyncHandler, validateDto } from '@utils';
import { AuthenticatedRequest } from '@/shared/types/authenticated-request';

export class TagController {
  public router: Router;
  private tagService: TagService;

  constructor(tagService: TagService) {
    this.router = Router();
    this.tagService = tagService;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/', asyncHandler(this.getTags));
    this.router.get('/:id', asyncHandler(this.getTagById));

    this.router.post('/', authenticate, authorize(Roles.ADMIN, Roles.MODERATOR), asyncHandler(this.createTag));
    this.router.patch('/:id', authenticate, authorize(Roles.ADMIN, Roles.MODERATOR), asyncHandler(this.patchTag));
    this.router.delete('/:id', authenticate, authorize(Roles.ADMIN), asyncHandler(this.deleteTag));
  }

  private getTags = async (req: Request, res: Response): Promise<void> => {
    const query = validateDto(queryTagsSchema, req.query);
    const result = await this.tagService.getTags(query);
    res.json({ data: result });
  };

  private getTagById = async (req: Request, res: Response): Promise<void> => {
    const tag = await this.tagService.getTagById(req.params['id'] as string);
    res.json({ data: tag });
  };

  private createTag = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const data = validateDto(createTagSchema, req.body);
    const tag = await this.tagService.createTag(data, req.user.id);
    res.status(201).json({ data: tag });
  };

  private patchTag = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const data = validateDto(patchTagSchema, req.body);
    const tag = await this.tagService.patchTag(req.params['id'] as string, data, req.user.id);
    res.json({ data: tag });
  };

  private deleteTag = async (req: Request, res: Response): Promise<void> => {
    await this.tagService.deleteTag(req.params['id'] as string);
    res.status(204).send();
  };
}
