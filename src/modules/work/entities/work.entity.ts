import { VisibilityStatus } from '@/shared/enums/visibility-status';
import { PublicationStatus } from '@/shared/enums/publication-status';
import { ModerationStatus } from '@/shared/enums/moderation-status';
import { UUID } from '@/shared/utils/uuid';
import { User } from '@/modules/user/entities/user.entity';
import { Tag } from '@/modules/work/entities/tag.entity';
import { Comment } from '@/modules/work/entities/comment.entity';
import { Rating } from '@/modules/work/entities/rating.entity';
import { CollectionEntry } from '@/modules/work/entities/collection-entry.entity';
import { MangaDetails } from '@/modules/work/entities/manga-details.entity';
import { AnimeDetails } from '@/modules/work/entities/anime-details.entity';
import { WorkType } from '@/modules/work/enums/work-type';
import { Favorite } from '@/modules/work/entities/favorite.entity';
import {
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  Index,
  DeleteDateColumn,
  Entity,
} from 'typeorm';
import { Post } from '@/modules/posts/entities/post.entity';

@Entity('works')
@Index(['type'])
@Index(['demographic'])
@Index(['contentRating'])
@Index(['publicationStatus'])
@Index(['visibilityStatus', 'moderationStatus'])
@Index(['startYear'])
@Index(['bayesianScore'])
@Index(['popularityScore'])
export class Work {
  @PrimaryColumn('uuid')
  id: string = UUID.generate();

  @Column({ length: 255 })
  @Index()
  title!: string;

  @Column({ length: 255, nullable: true })
  nativeTitle?: string;

  @Column({ length: 255, nullable: true })
  englishTitle?: string;

  @Column({ type: 'jsonb', nullable: true })
  alternativeTitles?: string[];

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ length: 500 })
  coverUrl!: string;

  @Column({ length: 500, nullable: true })
  bannerUrl?: string;

  @Column({ type: 'enum', enum: WorkType })
  type!: WorkType;

  @Column({ length: 50, nullable: true })
  demographic?: string;

  @Column({ length: 50, nullable: true })
  contentRating?: string;

  @Column({ type: 'enum', enum: VisibilityStatus, default: VisibilityStatus.PUBLIC })
  visibilityStatus!: VisibilityStatus;

  @Column({ type: 'enum', enum: PublicationStatus, default: PublicationStatus.DRAFT })
  publicationStatus!: PublicationStatus;

  @Column({ type: 'enum', enum: ModerationStatus, default: ModerationStatus.OK })
  moderationStatus!: ModerationStatus;

  @Column({ type: 'int', nullable: true })
  startYear?: number;

  @Column({ type: 'int', nullable: true })
  endYear?: number;

  @Column({ type: 'real', default: 0 })
  averageRating!: number;

  @Column({ type: 'int', default: 0 })
  ratingCount!: number;

  @Column({ type: 'jsonb', nullable: true })
  ratingDistribution?: Record<number, number>;

  @Column({ type: 'real', default: 0 })
  bayesianScore!: number;

  @Column({ type: 'int', default: 0 })
  favoriteCount!: number;

  @Column({ type: 'int', default: 0 })
  commentCount!: number;

  @Column({ type: 'int', default: 0 })
  planToReadCount!: number;

  @Column({ type: 'int', default: 0 })
  readingCount!: number;

  @Column({ type: 'int', default: 0 })
  completedCount!: number;

  @Column({ type: 'int', default: 0 })
  onHoldCount!: number;

  @Column({ type: 'int', default: 0 })
  droppedCount!: number;

  @Column({ type: 'real', default: 0 })
  popularityScore!: number;

  @Column({ type: 'int', nullable: true })
  popularityRank?: number;

  @Column({ type: 'int', nullable: true })
  scoreRank?: number;

  @Column({ type: 'int', default: 0 })
  featuredWeight!: number;

  @Column({ length: 255, unique: true })
  @Index({ unique: true })
  slug!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt?: Date;

  @ManyToOne(() => User, (user) => user.createdWorks, { nullable: true })
  createdBy?: User;

  @Column({ type: 'uuid', nullable: true })
  createdById?: string;

  @ManyToOne(() => User, { nullable: true })
  updatedBy?: User;

  @Column({ type: 'uuid', nullable: true })
  updatedById?: string;

  @ManyToMany(() => Tag, (tag) => tag.works)
  @JoinTable({
    name: 'work_tags',
    joinColumn: { name: 'work_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags!: Tag[];

  @OneToOne(() => MangaDetails, (details) => details.work, { cascade: ['insert', 'update'] })
  mangaDetails?: MangaDetails;

  @OneToOne(() => AnimeDetails, (details) => details.work, { cascade: ['insert', 'update'] })
  animeDetails?: AnimeDetails;

  @OneToMany(() => Comment, (comment) => comment.work)
  comments!: Comment[];

  @OneToMany(() => Rating, (rating) => rating.work)
  ratings!: Rating[];

  @OneToMany(() => CollectionEntry, (entry) => entry.work)
  collectionEntries!: CollectionEntry[];

  @OneToMany(() => Favorite, (favorite) => favorite.work)
  favorites!: Favorite[];

  @OneToMany(() => Post, (post) => post.work)
  posts!: Post[];
}
