import { UUID } from '@utils';
import { User } from './user.entity';

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ProfileLayoutJson } from '@/shared/types/profile-layout-json';

@Entity('user_profile_customizations')
@Index(['userId'], { unique: true })
export class UserProfileCustomization {
  @PrimaryColumn('uuid')
  id: string = UUID.generate();

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @OneToOne(() => User, (user) => user.profileCustomization, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'jsonb' })
  publishedLayout!: ProfileLayoutJson;

  @Column({ type: 'jsonb', nullable: true })
  draftLayout?: ProfileLayoutJson;

  @Column({ type: 'int', default: 1 })
  schemaVersion!: number;

  @Column({ default: true })
  isEnabled!: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  publishedAt?: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
