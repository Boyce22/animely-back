import { Post } from '@/modules/posts/entities/post.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

@Entity('video_posts')
export class VideoPost {
  @PrimaryColumn('uuid', { name: 'post_id' })
  postId!: string;

  @OneToOne(() => Post, (post) => post.video, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'post_id' })
  post!: Post;

  @Column({ name: 'video_url', length: 500 })
  videoUrl!: string;

  @Column({ name: 'thumbnail_url', length: 500, nullable: true })
  thumbnailUrl?: string;

  @Column({ name: 'duration_seconds', type: 'int' })
  durationSeconds!: number;

  @Column({ type: 'int' })
  width!: number;

  @Column({ type: 'int' })
  height!: number;

  @Column({ name: 'is_vertical', type: 'boolean', default: true })
  isVertical!: boolean;

  @Column({ name: 'view_count', type: 'int', default: 0 })
  viewCount!: number;
}
