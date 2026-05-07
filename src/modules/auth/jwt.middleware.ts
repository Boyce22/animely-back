import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

import { AuthService, JWTPayload } from '@/modules/auth/auth.service';
import { Roles } from '@/shared/security/roles.enum';
import { ForbiddenError, UnauthorizedError } from '@errors';
import { User } from '@/modules/user/entities/user.entity';

type DecodedToken = JwtPayload & JWTPayload;

export class JWTMiddleware {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
    try {
      const token = this.extractToken(req);
      if (!token) throw new UnauthorizedError('No token provided');

      const decoded = this.authService.verifyAccessToken(token) as DecodedToken;

      const user = await this.authService.getAuthUser(decoded.userId);

      if (!user) throw new UnauthorizedError('User not found');
      if (user.deletedAt) throw new ForbiddenError('Account is deactivated');

      // 🔐 invalidar token se senha mudou após emissão
      if (user.lastPasswordChange && decoded.iat) {
        const tokenIssuedAt = decoded.iat * 1000;

        if (tokenIssuedAt < user.lastPasswordChange.getTime()) {
          throw new UnauthorizedError('Session expired due to password change');
        }
      }

      req.user = user as User;
      req.userId = user.id;
      req.sessionId = decoded.sessionId;

      next();
    } catch (error) {
      next(error);
    }
  }

  authorize(...allowedRoles: Roles[]) {
    return (req: Request, _res: Response, next: NextFunction): void => {
      try {
        if (!req.user) {
          throw new UnauthorizedError('Authentication required');
        }

        if (!allowedRoles.includes(req.user.role as Roles)) {
          throw new ForbiddenError('Insufficient permissions');
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  private extractToken(req: Request): string | null {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    return authHeader.slice(7);
  }
}

const jwtMiddleware = new JWTMiddleware();

export const authenticate = jwtMiddleware.authenticate.bind(jwtMiddleware);
export const authorize = jwtMiddleware.authorize.bind(jwtMiddleware);