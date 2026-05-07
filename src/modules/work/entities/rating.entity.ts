import { UUID } from '@/shared/utils/uuid';
import { User } from '@/modules/user/entities/user.entity';
import { Entity, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, PrimaryColumn, Index } from 'typeorm';
import { Work } from '@/modules/work/entities/work.entity';

@Entity('ratings')
@Index(['userId', 'workId'], { unique: true })
export class Rating {
  @PrimaryColumn('uuid')
  id: string = UUID.generate();

  @Column({ type: 'decimal', precision: 3, scale: 2 })
  score!: number; // 0.00 a 10.00

  @Column({ type: 'text', nullable: true })
  review?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  // Relacionamentos
  @ManyToOne(() => User, (user) => user.ratings, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user!: User;

  @Column({ type: 'uuid' })
  @Index()
  userId!: string;

  @ManyToOne(() => Work, (work) => work.ratings, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  work!: Work;

  @Column({ type: 'uuid' })
  @Index()
  workId!: string;
}
