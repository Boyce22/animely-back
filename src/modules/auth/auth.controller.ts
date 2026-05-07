import { Request, Response, Router } from 'express';
import { AuthService } from '@/modules/auth/auth.service';
import { registerSchema } from '@/modules/auth/dtos/register.dto';
import { loginSchema } from '@/modules/auth/dtos/login.dto';
import { refreshTokenSchema } from '@/modules/auth/dtos/refresh-token.dto';
import { authenticate } from '@/modules/auth/jwt.middleware';
import { AuthenticatedRequest } from '@/shared/types/authenticated-request';
import { asyncHandler, validateDto } from '@utils';
import { changePasswordSchema } from '@/modules/auth/dtos/change-password.dto';

export class AuthController {
  public router: Router;
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.router = Router();
    this.authService = authService;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/register', asyncHandler(this.register));
    this.router.post('/login', asyncHandler(this.login));
    this.router.post('/refresh', asyncHandler(this.refreshToken));
    this.router.post('/logout', authenticate, asyncHandler(this.logout));
    this.router.post('/change-password', authenticate, asyncHandler(this.changePassword));
    this.router.get('/me', authenticate, asyncHandler(this.getCurrentUser));
  }

  private register = async (req: Request, res: Response): Promise<void> => {
    const data = validateDto(registerSchema, req.body);
    const result = await this.authService.register(data);
    res.status(201).json({ data: result });
  };

  private login = async (req: Request, res: Response): Promise<void> => {
    const data = validateDto(loginSchema, req.body);
    const result = await this.authService.login(data);
    res.json({ data: result });
  };

  private refreshToken = async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = validateDto(refreshTokenSchema, req.body);
    const result = await this.authService.refreshToken(refreshToken);
    res.json({ data: result });
  };

  private logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    await this.authService.logout(req.user.id, req.sessionId);
    res.status(204).send();
  };

  private changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const data = validateDto(changePasswordSchema, req.body);
    await this.authService.changePassword(req.user.id, data);
    res.status(204).send();
  };

  private getCurrentUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const user = req.user;

    res.json({
      data: {
        id: user.id,
        name: user.name,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        role: user.role,

        profilePictureUrl: user.profilePictureUrl,
        bannerUrl: user.bannerUrl,
        biography: user.biography,

        isVerified: user.isVerified,

        subscriptionTier: user.subscriptionTier,

        theme: user.theme,
        preferredLanguage: user.preferredLanguage,

        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLoginAt: user.lastLoginAt,
      },
    });
  };
}
