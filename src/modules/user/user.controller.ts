import { Request, Response, Router } from 'express';

import { Roles } from '@/shared/security';
import { asyncHandler, validateDto } from '@utils';
import { BadRequestError } from '@errors';
import { AuthenticatedRequest } from '@/shared/types/authenticated-request';

import { UserService } from '@/modules/user/user.service';
import {
  patchUserSchema,
  queryUsersSchema,
  updateUserSchema,
} from '@/modules/user/schemas';
import { authenticate, authorize } from '@/modules/auth/jwt.middleware';

import { CountryService } from '@/modules/country/country.service';
import { UPLOAD_MIDDLEWARE } from '@/shared/storage/upload/upload.config';
import { patchUserAsOwnerSchema } from './schemas/patch-user-as-owner.schema';

export class UserController {
  public router: Router;
  private userService: UserService;
  private countryService: CountryService;

  constructor(userService: UserService, countryService: CountryService) {
    this.router = Router();
    this.userService = userService;
    this.countryService = countryService;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/me', authenticate, asyncHandler(this.getMe));
    this.router.put('/me', authenticate, asyncHandler(this.updateMe));
    this.router.patch('/me', authenticate, asyncHandler(this.patchMe));
    this.router.post(
      '/me/profile-picture',
      authenticate,
      UPLOAD_MIDDLEWARE.PROFILE_PICTURE,
      asyncHandler(this.changeProfilePicture),
    );
    this.router.post('/me/banner', authenticate, UPLOAD_MIDDLEWARE.BANNER, asyncHandler(this.changeBanner));

    this.router.get('/', authenticate, asyncHandler(this.getUsers));
    this.router.get('/:id', authenticate, asyncHandler(this.getUserById));

    this.router.patch('/:id', authenticate, authorize(Roles.OWNER), asyncHandler(this.patchUser));
    this.router.delete('/:id', authenticate, authorize(Roles.ADMIN), asyncHandler(this.deleteUser));
    this.router.post('/:id/verify', authenticate, authorize(Roles.ADMIN), asyncHandler(this.verifyUser));
  }

  private getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const user = await this.userService.getUserById(req.user.id);
    res.json({ data: user });
  };

  private updateMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const data = validateDto(updateUserSchema, req.body);
    const { address: addressIds, ...userData } = data;
    const address = await this.countryService.validateAndBuildAddress(addressIds);
    const user = await this.userService.updateUserById(req.user.id, userData, address);
    res.json({ data: user });
  };

  private patchMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const data = validateDto(patchUserSchema, req.body);
    const { address: addressIds, ...userData } = data;
    const address = await this.countryService.validateAndBuildAddress(addressIds);
    const user = await this.userService.patchUserById(req.user.id, userData, address);
    res.json({ data: user });
  };

  private changeProfilePicture = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.file) throw new BadRequestError('No file provided');
    const profilePictureUrl = await this.userService.updateProfilePicture(req.user.id, req.file);
    res.json({ data: { profilePictureUrl } });
  };

  private changeBanner = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.file) throw new BadRequestError('No file provided');
    const bannerUrl = await this.userService.updateBanner(req.user.id, req.file);
    res.json({ data: { bannerUrl } });
  };

  private getUsers = async (req: Request, res: Response): Promise<void> => {
    const query = validateDto(queryUsersSchema, req.query);
    const result = await this.userService.getUsers(query);
    res.json({ data: result });
  };

  private getUserById = async (req: Request, res: Response): Promise<void> => {
    const user = await this.userService.getUserById(req.params.id as string);
    res.json({ data: user });
  };

  private patchUser = async (req: Request, res: Response): Promise<void> => {
    const data = validateDto(patchUserAsOwnerSchema, req.body);
    const { address: addressIds, ...userData } = data;
    const address = addressIds ? await this.countryService.validateAndBuildAddress(addressIds) : undefined;
    const user = await this.userService.patchUserById(req.params.id as string, userData, address);
    res.json({ data: user });
  };

  private deleteUser = async (req: Request, res: Response): Promise<void> => {
    await this.userService.softDeleteUserById(req.params.id as string);
    res.status(204).send();
  };

  private verifyUser = async (req: Request, res: Response): Promise<void> => {
    const user = await this.userService.verifyUser(req.params.id as string);
    res.json({ data: user });
  };
}
