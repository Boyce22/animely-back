import { z } from 'zod';
import { Request, Response, Router } from 'express';

import { CommentService } from '@/modules/work/services/comment.service';
import { createCommentSchema, patchCommentSchema, queryCommentsSchema } from '@/modules/work/schemas';

import { authenticate, authorize } from '@/modules/auth/jwt.middleware';
import { asyncHandler, validateDto } from '@utils';
import { AuthenticatedRequest } from '@/shared/types/authenticated-request';
import { Roles } from '@security';

const queryRepliesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

const queryTreeSchema = z.object({
  workId: z.uuid(),
  chapterId: z.uuid().optional(),
});

export class CommentController {
  public router: Router;
  private commentService: CommentService;

  constructor(commentService: CommentService) {
    this.router = Router();
    this.commentService = commentService;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/', asyncHandler(this.getComments));
    this.router.get('/:id/replies', asyncHandler(this.getCommentReplies));
    this.router.get('/tree', authenticate, authorize(Roles.ADMIN, Roles.USER), asyncHandler(this.getCommentTree));

    this.router.post('/', authenticate, asyncHandler(this.createComment));
    this.router.patch('/:id', authenticate, asyncHandler(this.patchComment));
    this.router.delete('/:id', authenticate, asyncHandler(this.deleteComment));
  }

  private getCommentTree = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { workId, chapterId } = validateDto(queryTreeSchema, req.query);
    const result = await this.commentService.getCommentTree(workId, chapterId);
    res.json({ data: result });
  };

  private getCommentReplies = async (req: Request, res: Response): Promise<void> => {
    const { page, limit } = validateDto(queryRepliesSchema, req.query);
    const result = await this.commentService.getCommentReplies(req.params['id'] as string, page, limit);
    res.json({ data: result });
  };

  private getComments = async (req: Request, res: Response): Promise<void> => {
    const query = validateDto(queryCommentsSchema, req.query);
    const result = await this.commentService.getComments(query);
    res.json({ data: result });
  };

  private createComment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const data = validateDto(createCommentSchema, req.body);
    const comment = await this.commentService.createComment(data, req.user.id);
    res.status(201).json({ data: comment });
  };

  private patchComment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const data = validateDto(patchCommentSchema, req.body);
    const comment = await this.commentService.patchComment(req.params['id'] as string, data, req.user.id, req.user.role);
    res.json({ data: comment });
  };

  private deleteComment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    await this.commentService.deleteComment(req.params['id'] as string, req.user.id, req.user.role);
    res.status(204).send();
  };
}
