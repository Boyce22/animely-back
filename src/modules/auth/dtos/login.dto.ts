import { z } from 'zod';

const emailSchema = z.email();

const usernameSchema = z
  .string()
  .min(3)
  .max(100)
  .regex(/^[a-zA-Z0-9_-]+$/);

export const loginSchema = z.object({
  identifier: z.union([emailSchema, usernameSchema], {
    error: 'Must be a valid email or username',
  }),

  password: z.string().min(1, 'Password is required'),
});

export type LoginDTO = z.infer<typeof loginSchema>;
