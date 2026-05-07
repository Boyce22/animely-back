import { z } from 'zod';
import { Roles } from '@/shared/security/roles.enum';

export const queryUsersSchema = z.object({
  page: z.coerce.number().int().positive().min(1),
  limit: z.coerce.number().int().positive().max(100).min(1),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'lastName', 'username', 'email', 'createdAt']).default('createdAt'),
  order: z.enum(['ASC', 'DESC']).default('ASC'),
  role: z.enum(Roles).optional(),
  active: z.coerce.boolean().optional(),
});

export type QueryUsersInput = z.infer<typeof queryUsersSchema>;
