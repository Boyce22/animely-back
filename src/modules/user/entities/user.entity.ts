import { Roles } from '@/shared/security/roles.enum';
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  Index,
  PrimaryColumn,
  OneToOne,
} from 'typeorm';

import { UUID } from '@/shared/utils/uuid';

import { Work } from '@/modules/work/entities/work.entity';
import { Tag } from '@/modules/work/entities/tag.entity';
import { Comment } from '@/modules/work/entities/comment.entity';
import { Rating } from '@/modules/work/entities/rating.entity';
import { Collection } from '@/modules/work/entities/collection.entity';
import { Favorite } from '@/modules/work/entities/favorite.entity';
import { UserFollow } from '@/modules/user/entities/user-follow.entity';
import { UserSanction } from '@/modules/user/entities/user-sanction.entity';
import { SubscriptionTier } from '@/shared/enums/subscription-tier';
import { Language } from '@/shared/enums/language';
import { Theme } from '@/shared/enums/theme';
import { Post } from '@/modules/posts/entities/post.entity';
import { UserProfileCustomization } from './user-profile-customization.entity';

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  BANNED = 'BANNED',
  DELETED = 'DELETED',
}

@Entity('users')
@Index(['email'], { unique: true })
@Index(['username'], { unique: true })
@Index(['status'])
@Index(['lastLoginAt'])
@Index(['createdAt'])
export class User {
  @PrimaryColumn('uuid')
  id: string = UUID.generate(); //ok

  @Column({ length: 100 })
  name!: string; //ok

  @Column({ length: 100 })
  lastName!: string; //ok

  @Column({ unique: true, length: 100 })
  username!: string; //ok

  @Column({ length: 255, select: false }) // Never select password by default
  password!: string; //ok

  @Column({ type: 'text', nullable: true })
  biography?: string; //ok

  @Column({ type: 'date', nullable: true })
  birthDate?: Date; //ok

  @Column({ unique: true, length: 255 })
  email!: string; //ok

  @Column({ type: 'enum', enum: Roles, default: Roles.USER })
  role!: Roles; //ok

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status!: UserStatus;

  @Column({ type: 'enum', enum: SubscriptionTier, default: SubscriptionTier.FREE })
  subscriptionTier!: SubscriptionTier; //ok

  @Column({ default: false })
  isVerified!: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  lastPasswordChange?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  emailVerifiedAt?: Date;

  @Column({ length: 255, nullable: true, select: false })
  verificationTokenHash?: string;

  @Column({ length: 255, nullable: true, select: false })
  resetPasswordTokenHash?: string;

  @Column({ type: 'timestamptz', nullable: true })
  resetPasswordExpires?: Date;

  @Column({ length: 500, nullable: true })
  profilePictureUrl?: string;

  @Column({ length: 500, nullable: true })
  bannerUrl?: string;

  @Column({ type: 'text', nullable: true })
  address?: string; // ok

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date; //ok

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date; //ok

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt?: Date; //ok

  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt?: Date;

  // Statistics
  @Column({ type: 'int', default: 0 })
  worksCreated!: number;

  @Column({ type: 'int', default: 0 })
  commentsCount!: number;

  @Column({ type: 'int', default: 0 })
  favoritesCount!: number;

  @Column({ type: 'int', default: 0 })
  ratingsCount!: number;

  // Settings
  @Column({ default: true })
  showMatureContent!: boolean;

  @Column({ type: 'enum', enum: Language, default: Language.ENGLISH })
  preferredLanguage!: Language;

  @Column({ type: 'enum', enum: Theme, default: Theme.DARK })
  theme!: Theme;

  @OneToMany(() => Work, (work) => work.createdBy)
  createdWorks!: Work[];

  @OneToMany(() => Tag, (tag) => tag.createdBy)
  createdTags!: Tag[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments!: Comment[];

  @OneToMany(() => Rating, (rating) => rating.user)
  ratings!: Rating[];

  @OneToMany(() => Collection, (collection) => collection.createdBy)
  collections!: Collection[];

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites!: Favorite[];

  @OneToMany(() => UserFollow, (follow) => follow.follower)
  following!: UserFollow[];

  @OneToMany(() => UserFollow, (follow) => follow.following)
  followers!: UserFollow[];

  @OneToMany(() => UserSanction, (sanction) => sanction.user)
  sanctions!: UserSanction[];

  @OneToMany(() => Post, (post) => post.author)
  posts!: Post[];

  @OneToOne(() => UserProfileCustomization, (customization) => customization.user)
  profileCustomization?: UserProfileCustomization;

  @Column({ type: 'int', default: 0 })
  collectionsCount!: number;

  @Column({ type: 'int', default: 0 })
  followingCount!: number;

  @Column({ type: 'int', default: 0 })
  followersCount!: number;

  @Column({ default: true })
  isProfilePublic!: boolean;

  @Column({ default: true })
  showActivity!: boolean;

  @Column({ default: true })
  showCollections!: boolean;

  @Column({ length: 50, nullable: true })
  timeZone?: string;

  get fullName(): string {
    return `${this.name} ${this.lastName}`;
  }

  get age(): number | null {
    if (!this.birthDate) return null;
    const today = new Date();
    const birthDate = new Date(this.birthDate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  isAdult(): boolean {
    const userAge = this.age;
    return userAge !== null && userAge >= 18;
  }

  hasRole(role: Roles): boolean {
    return this.role === role;
  }

  isAdmin(): boolean {
    return this.role === Roles.ADMIN || this.role === Roles.OWNER;
  }

  isModerator(): boolean {
    return this.role === Roles.MODERATOR || this.isAdmin();
  }
}
