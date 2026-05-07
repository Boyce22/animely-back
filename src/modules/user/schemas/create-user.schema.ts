import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Must contain at least one special character');

export const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  lastName: z.string().min(2).max(100),
  username: z
    .string()
    .min(3)
    .max(100)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username must contain only letters, numbers, underscores and hyphens'),
  email: z.email(),
  password: passwordSchema,
  birthDate: z.coerce.date().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
