import { User } from '@/modules/user/entities/user.entity';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      userId?: string;
      sessionId?: string;
    }
  }
}

export {};
