import { User } from '@/modules/user/entities/user.entity';
import { Work } from '@/modules/work/entities/work.entity';
import { ArticlePost } from '@/modules/posts/entities/article-post.entity';
import { VideoPost } from '@/modules/posts/entities/video-post.entity';
import { ModerationStatus } from '@/modules/posts/enums/moderation-status';
import { PostStatus } from '@/modules/posts/enums/post-status';
import { PostType } from '@/modules/posts/enums/post-type';
import { VisibilityStatus } from '@/modules/posts/enums/visibility-status';
import { UUID } from '@utils';
import {
  Entity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Index('idx_posts_author_id', ['authorId'])
@Index('idx_posts_work_id', ['workId'])
@Index('idx_posts_type', ['type'])
@Index('idx_posts_status', ['status'])
@Index('idx_posts_visibility_status', ['visibilityStatus'])
@Index('idx_posts_moderation_status', ['moderationStatus'])
@Index('idx_posts_published_at', ['publishedAt'])
@Entity('posts')
export class Post {
  @PrimaryColumn('uuid')
  id: string = UUID.generate();

  @Column({
    type: 'enum',
    enum: PostType,
    enumName: 'post_type_enum',
  })
  type!: PostType;

  @Column({ name: 'author_id', type: 'uuid' })
  authorId!: string;

  @ManyToOne(() => User, (user) => user.posts, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'author_id' })
  author!: User;

  @Column({ name: 'work_id', type: 'uuid', nullable: true })
  workId?: string;

  @ManyToOne(() => Work, (work) => work.posts, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'work_id' })
  work?: Work;

  @Column({ length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  caption?: string;

  @Column({ name: 'like_count', type: 'int', default: 0 })
  likeCount!: number;

  @Column({ name: 'comment_count', type: 'int', default: 0 })
  commentCount!: number;

  @Column({ name: 'share_count', type: 'int', default: 0 })
  shareCount!: number;

  @Column({ name: 'save_count', type: 'int', default: 0 })
  saveCount!: number;

  @Column({
    type: 'enum',
    enum: PostStatus,
    enumName: 'post_status_enum',
    default: PostStatus.DRAFT,
  })
  status!: PostStatus;

  @Column({
    name: 'visibility_status',
    type: 'enum',
    enum: VisibilityStatus,
    enumName: 'post_visibility_status_enum',
    default: VisibilityStatus.PUBLIC,
  })
  visibilityStatus!: VisibilityStatus;

  @Column({
    name: 'moderation_status',
    type: 'enum',
    enum: ModerationStatus,
    enumName: 'post_moderation_status_enum',
    default: ModerationStatus.IN_REVIEW,
  })
  moderationStatus!: ModerationStatus;

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt?: Date;

  @OneToOne(() => ArticlePost, (article) => article.post)
  article?: ArticlePost;

  @OneToOne(() => VideoPost, (video) => video.post)
  video?: VideoPost;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date;
}
