import { validateWorkDetails, workSchemaBase } from './create-work.schema';

export const patchWorkSchema = workSchemaBase.partial().superRefine(validateWorkDetails);

export type PatchWorkInput = Partial<import('./create-work.schema').CreateWorkInput>;
