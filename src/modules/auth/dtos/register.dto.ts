import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),

  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(100),

  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(100)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores and hyphens'),

  email: z.email('Invalid email address'),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),

  birthDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: 'Invalid birth date',
    })
    .refine(
      (date) => {
        const birth = new Date(date);
        const today = new Date();
        return birth <= today;
      },
      {
        message: 'Birth date cannot be in the future',
      },
    )
    .refine(
      (date) => {
        const birth = new Date(date);
        const today = new Date();

        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
          age--;
        }

        return age >= 18;
      },
      {
        message: 'You must be at least 18 years old',
      },
    ),
});

export type RegisterDTO = z.infer<typeof registerSchema>;
