import { z } from 'zod';
import { Language } from '@/shared/enums/language';
import { Theme } from '@/shared/enums/theme';

export const patchUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  lastName: z.string().min(2).max(100).optional(),
  username: z.string().min(3).max(100).optional(),
  email: z.email().optional(),
  biography: z.string().max(500).optional(),
  birthDate: z.coerce.date().optional(),
  showMatureContent: z.boolean().optional(),
  preferredLanguage: z.enum(Language).optional(),
  theme: z.enum(Theme).optional(),
  isProfilePublic: z.boolean().optional(),
  showActivity: z.boolean().optional(),
  showCollections: z.boolean().optional(),
  address: z
    .object({
      countryId: z.number().positive().optional(),
      stateId: z.number().positive().optional(),
      cityId: z.number().positive().optional(),
      timeZoneId: z.number().positive().optional(),
    })
    .optional(),
});

export type PatchUserInput = z.infer<typeof patchUserSchema>;
