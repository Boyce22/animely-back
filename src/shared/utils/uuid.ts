import { v7 as uuidv7 } from 'uuid';

export const UUID = {
  PATTERN: /^[0-9a-fA-F-]{36}$/,
  isValid: (v: string) => UUID.PATTERN.test(v),
  generate: () => uuidv7(),
} as const;
