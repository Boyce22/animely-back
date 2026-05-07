import { z } from 'zod';
import { Roles } from '@/shared/security/roles.enum';
import { SubscriptionTier } from '@/shared/enums/subscription-tier';
import { Language } from '@/shared/enums/language';
import { Theme } from '@/shared/enums/theme';

export const patchUserAsOwnerSchema = z.object({
  // identity
  name: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  username: z.string().min(3).max(100).optional(),
  email: z.email().max(255).optional(),

  // profile
  biography: z.string().max(5000).optional(),
  birthDate: z.coerce.date().optional(),
  address: z
    .object({
      countryId: z.number().positive().optional(),
      stateId: z.number().positive().optional(),
      cityId: z.number().positive().optional(),
      timeZoneId: z.number().positive().optional(),
    })
    .optional(),

  profilePictureUrl: z.url().max(500).nullable().optional(),
  bannerUrl: z.url().max(500).nullable().optional(),

  // permissions / status
  role: z.enum(Roles).optional(),
  subscriptionTier: z.enum(SubscriptionTier).optional(),
  isVerified: z.boolean().optional(),

  // settings
  showMatureContent: z.boolean().optional(),
  preferredLanguage: z.enum(Language).optional(),
  theme: z.enum(Theme).optional(),
  isProfilePublic: z.boolean().optional(),
  showActivity: z.boolean().optional(),
  showCollections: z.boolean().optional(),
  timeZone: z.string().max(50).nullable().optional(),

  // security (OWNER ONLY POWERFUL)
  lastPasswordChange: z.coerce.date().nullable().optional(),
  emailVerifiedAt: z.coerce.date().nullable().optional(),

  // login tracking (raramente usado manualmente)
  lastLoginAt: z.coerce.date().nullable().optional(),
});

export type PatchUserAsOwnerInput = z.infer<typeof patchUserAsOwnerSchema>;
