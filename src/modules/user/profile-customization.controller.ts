import { Request, Response, Router } from 'express';

import { asyncHandler, validateDto } from '@utils';
import { AuthenticatedRequest } from '@/shared/types/authenticated-request';
import { authenticate } from '@/modules/auth/jwt.middleware';

import { ProfileCustomizationService } from '@/modules/user/profile-customization.service';
import {
  patchProfileCustomizationSchema,
  profileLayoutSchema,
} from '@/modules/user/schemas/profile-layout.schema';

export class ProfileCustomizationController {
  public router: Router;

  constructor(private readonly profileCustomizationService: ProfileCustomizationService) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/me/profile-customization', authenticate, asyncHandler(this.getOwn));
    this.router.put('/me/profile-customization/draft', authenticate, asyncHandler(this.saveDraft));
    this.router.post('/me/profile-customization/publish', authenticate, asyncHandler(this.publish));
    this.router.delete('/me/profile-customization/draft', authenticate, asyncHandler(this.discardDraft));
    this.router.patch('/me/profile-customization', authenticate, asyncHandler(this.patchSettings));
    this.router.get('/:id/profile-customization', authenticate, asyncHandler(this.getPublic));
  }

  private getOwn = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const data = await this.profileCustomizationService.getOwnCustomization(req.user.id);
    res.json({ data });
  };

  private saveDraft = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const layout = validateDto(profileLayoutSchema, req.body);
    const data = await this.profileCustomizationService.saveDraft(req.user.id, layout);
    res.json({ data });
  };

  private publish = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const data = await this.profileCustomizationService.publishDraft(req.user.id);
    res.json({ data });
  };

  private discardDraft = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const data = await this.profileCustomizationService.discardDraft(req.user.id);
    res.json({ data });
  };

  private patchSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { isEnabled } = validateDto(patchProfileCustomizationSchema, req.body);
    const data = await this.profileCustomizationService.setEnabled(req.user.id, isEnabled);
    res.json({ data });
  };

  private getPublic = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const data = await this.profileCustomizationService.getPublicCustomization(
      req.user.id,
      req.params.id as string,
    );
    res.json({ data });
  };
}
