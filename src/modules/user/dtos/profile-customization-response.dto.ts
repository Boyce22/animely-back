import { ProfileLayoutJson } from '@/shared/types/profile-layout-json';

export interface ProfileCustomizationResponse {
  id: string;
  userId: string;
  publishedLayout: ProfileLayoutJson;
  draftLayout?: ProfileLayoutJson;
  schemaVersion: number;
  isEnabled: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicProfileLayoutResponse {
  publishedLayout: ProfileLayoutJson;
  isEnabled: boolean;
  publishedAt?: string;
}
