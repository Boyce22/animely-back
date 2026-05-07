import { Post } from '@/modules/posts/entities/post.entity';
import { ArticleContentBlock } from '@/modules/posts/interfaces/article-content-block.interface';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

@Entity('article_posts')
export class ArticlePost {
  @PrimaryColumn('uuid', { name: 'post_id' })
  postId!: string;

  @OneToOne(() => Post, (post) => post.article, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'post_id' })
  post!: Post;

  @Column({ name: 'banner_url', length: 500, nullable: true })
  bannerUrl?: string;

  @Column({ type: 'text', nullable: true })
  excerpt?: string;

  @Column({ name: 'content_json', type: 'jsonb' })
  contentJson!: ArticleContentBlock[];

  @Column({ name: 'reading_time_minutes', type: 'int', default: 1 })
  readingTimeMinutes!: number;
}
