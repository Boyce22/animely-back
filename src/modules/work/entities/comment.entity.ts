import { UUID } from '@/shared/utils/uuid';
import { User } from '@/modules/user/entities/user.entity';
import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  Index,
  DeleteDateColumn,
  Tree,
  TreeParent,
  TreeChildren,
} from 'typeorm';
import { Work } from '@/modules/work/entities/work.entity';

@Entity('comments')
@Tree('closure-table')
export class Comment {
  @PrimaryColumn('uuid')
  id: string = UUID.generate();

  @Column({ type: 'text' })
  content!: string;

  // Timestamps
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt?: Date;

  @Column({ default: false })
  isEdited!: boolean;

  @Column({ default: false })
  isPinned!: boolean;

  @Column({ default: false })
  isSpoiler!: boolean;

  // Estatísticas
  @Column({ type: 'int', default: 0 })
  likeCount!: number;

  @Column({ type: 'int', default: 0 })
  dislikeCount!: number;

  @Column({ type: 'int', default: 0 })
  replyCount!: number;

  @ManyToOne(() => Work, (work) => work.comments, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  work?: Work;

  @Column({ type: 'uuid', nullable: true })
  workId?: string;

  @Column({ type: 'uuid', nullable: true })
  chapterId?: string;

  // Usuário autor
  @ManyToOne(() => User, (user) => user.comments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user!: User;

  @Column({ type: 'uuid' })
  userId!: string;

  // Sistema de respostas (thread)
  @TreeParent()
  parentComment?: Comment;

  @TreeChildren()
  replies!: Comment[];

  @Column({ type: 'uuid', nullable: true })
  parentCommentId?: string;
}
