import { Repository } from 'typeorm';

import { UUID } from '@utils';
import { NotFoundError } from '@errors';
import { ProfileLayoutJson } from '@/shared/types/profile-layout-json';
import { UserProfileCustomization } from '@/modules/user/entities/user-profile-customization.entity';

export class ProfileCustomizationRepository {
  constructor(private readonly repository: Repository<UserProfileCustomization>) {}

  async findByUserId(userId: string): Promise<UserProfileCustomization | null> {
    return this.repository.findOne({ where: { userId } });
  }

  async saveDraft(userId: string, layout: ProfileLayoutJson, defaultPublished: ProfileLayoutJson): Promise<UserProfileCustomization> {
    let record = await this.findByUserId(userId);

    if (!record) {
      record = this.repository.create({
        id: UUID.generate(),
        userId,
        publishedLayout: defaultPublished,
        draftLayout: layout,
      });
    } else {
      record.draftLayout = layout;
    }

    return this.repository.save(record);
  }

  async publish(userId: string): Promise<UserProfileCustomization> {
    const record = await this.findByUserIdOrFail(userId);

    if (!record.draftLayout) {
      throw new Error('No draft to publish');
    }

    record.publishedLayout = record.draftLayout;
    record.draftLayout = undefined;
    record.publishedAt = new Date();

    return this.repository.save(record);
  }

  async discardDraft(userId: string): Promise<UserProfileCustomization> {
    const record = await this.findByUserIdOrFail(userId);
    record.draftLayout = undefined;
    return this.repository.save(record);
  }

  async setEnabled(userId: string, isEnabled: boolean): Promise<UserProfileCustomization> {
    const record = await this.findByUserIdOrFail(userId);
    record.isEnabled = isEnabled;
    return this.repository.save(record);
  }

  private async findByUserIdOrFail(userId: string): Promise<UserProfileCustomization> {
    const record = await this.findByUserId(userId);
    if (!record) throw new NotFoundError('Profile customization not found');
    return record;
  }
}
