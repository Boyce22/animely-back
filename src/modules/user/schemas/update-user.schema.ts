import { z } from 'zod';

import { createUserSchema } from '@/modules/user/schemas/create-user.schema';

const addressSchema = z
  .object({
    countryId: z.number().positive().optional(),
    stateId: z.number().positive().optional(),
    cityId: z.number().positive().optional(),
    timeZoneId: z.number().positive().optional(),
  })
  .optional();

export const updateUserSchema = createUserSchema.omit({ password: true }).extend({ address: addressSchema });

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
