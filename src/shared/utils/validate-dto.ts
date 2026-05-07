import { ZodType } from 'zod';
import { AppError } from '@errors';

export function validateDto<T>(schema: ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const formattedErrors = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      errors: [issue.message],
    }));

    throw new AppError('Validation failed', 400, formattedErrors);
  }

  return result.data;
}
