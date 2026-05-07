import { Logger } from 'pino';

import { ConflictError, NotFoundError } from '@errors';
import { ProfileLayoutJson } from '@/shared/types/profile-layout-json';
import { UserRepository } from '@/modules/user/user.repository';
import { ProfileCustomizationRepository } from '@/modules/user/profile-customization.repository';
import {
  ProfileCustomizationResponse,
  PublicProfileLayoutResponse,
} from '@/modules/user/dtos/profile-customization-response.dto';
import { UserProfileCustomization } from '@/modules/user/entities/user-profile-customization.entity';

export class ProfileCustomizationService {
  constructor(
    private readonly customizationRepository: ProfileCustomizationRepository,
    private readonly userRepository: UserRepository,
    private readonly logger: Logger,
  ) {}

  async getOwnCustomization(userId: string): Promise<ProfileCustomizationResponse> {
    await this.assertUserExists(userId);

    const record = await this.customizationRepository.findByUserId(userId);

    if (!record) {
      return this.buildEmptyResponse(userId);
    }

    return this.toResponse(record);
  }

  async getPublicCustomization(viewerId: string, targetUserId: string): Promise<PublicProfileLayoutResponse> {
    const target = await this.userRepository.findById(targetUserId);

    if (!target) throw new NotFoundError('User not found');
    if (!target.isProfilePublic && viewerId !== targetUserId) {
      throw new NotFoundError('Profile not found');
    }

    const record = await this.customizationRepository.findByUserId(targetUserId);

    if (!record || !record.isEnabled) {
      return { publishedLayout: buildDefaultLayout(), isEnabled: false };
    }

    return {
      publishedLayout: record.publishedLayout,
      isEnabled: record.isEnabled,
      publishedAt: record.publishedAt?.toISOString(),
    };
  }

  async saveDraft(userId: string, layout: ProfileLayoutJson): Promise<ProfileCustomizationResponse> {
    await this.assertUserExists(userId);

    const record = await this.customizationRepository.saveDraft(
      userId,
      layout,
      buildDefaultLayout(),
    );

    this.logger.info({ userId }, 'Profile draft saved');
    return this.toResponse(record);
  }

  async publishDraft(userId: string): Promise<ProfileCustomizationResponse> {
    await this.assertUserExists(userId);

    const existing = await this.customizationRepository.findByUserId(userId);

    if (!existing?.draftLayout) {
      throw new ConflictError('No draft layout to publish');
    }

    const record = await this.customizationRepository.publish(userId);

    this.logger.info({ userId }, 'Profile layout published');
    return this.toResponse(record);
  }

  async discardDraft(userId: string): Promise<ProfileCustomizationResponse> {
    await this.assertUserExists(userId);

    const record = await this.customizationRepository.discardDraft(userId);

    this.logger.info({ userId }, 'Profile draft discarded');
    return this.toResponse(record);
  }

  async setEnabled(userId: string, isEnabled: boolean): Promise<ProfileCustomizationResponse> {
    await this.assertUserExists(userId);

    const record = await this.customizationRepository.setEnabled(userId, isEnabled);

    this.logger.info({ userId, isEnabled }, 'Profile customization toggled');
    return this.toResponse(record);
  }

  private async assertUserExists(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found');
  }

  private toResponse(record: UserProfileCustomization): ProfileCustomizationResponse {
    return {
      id: record.id,
      userId: record.userId,
      publishedLayout: record.publishedLayout,
      draftLayout: record.draftLayout,
      schemaVersion: record.schemaVersion,
      isEnabled: record.isEnabled,
      publishedAt: record.publishedAt?.toISOString(),
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }

  private buildEmptyResponse(userId: string): ProfileCustomizationResponse {
    const now = new Date().toISOString();
    return {
      id: '',
      userId,
      publishedLayout: buildDefaultLayout(),
      schemaVersion: 1,
      isEnabled: true,
      createdAt: now,
      updatedAt: now,
    };
  }
}

export function buildDefaultLayout(): ProfileLayoutJson {
  return {
    version: 2,
    grid: { cols: 12, rowHeight: 40, gap: 8 },
    theme: {
      background: { type: 'solid', color: '#0f0f0f' },
      textColor: '#ffffff',
      accentColor: '#7c3aed',
      cardStyle: 'glass',
    },
    widgets: [
      {
        id: 'default-avatar',
        type: 'AVATAR_CARD',
        visible: true,
        position: { x: 0, y: 0, w: 3, h: 6 },
        config: {},
      },
      {
        id: 'default-bio',
        type: 'BIO',
        visible: true,
        position: { x: 3, y: 0, w: 9, h: 3 },
        config: {},
      },
      {
        id: 'default-anime-stats',
        type: 'STATS_ANIME',
        visible: true,
        position: { x: 3, y: 3, w: 4, h: 3 },
        config: {},
      },
      {
        id: 'default-manga-stats',
        type: 'STATS_MANGA',
        visible: true,
        position: { x: 7, y: 3, w: 5, h: 3 },
        config: {},
      },
      {
        id: 'default-favorite-anime',
        type: 'FAVORITE_ANIME',
        title: 'Favorite Anime',
        visible: true,
        position: { x: 0, y: 6, w: 6, h: 6 },
        config: { maxItems: 6 },
      },
      {
        id: 'default-favorite-manga',
        type: 'FAVORITE_MANGA',
        title: 'Favorite Manga',
        visible: true,
        position: { x: 6, y: 6, w: 6, h: 6 },
        config: { maxItems: 6 },
      },
    ],
  };
}
