import { Request } from 'express';
import { User } from '@/modules/user/entities/user.entity';

export type AuthenticatedRequest = Request & { user: User; sessionId: string };
