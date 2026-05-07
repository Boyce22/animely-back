import { UUID } from '@/shared/utils/uuid';
import { User } from '@/modules/user/entities/user.entity';
import { Work } from '@/modules/work/entities/work.entity';
import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity('favorites')
@Index(['userId', 'workId'], { unique: true })
export class Favorite {
  @PrimaryColumn('uuid')
  id: string = UUID.generate();

  @ManyToOne(() => User, (user) => user.favorites, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user!: User;

  @Column({ type: 'uuid' })
  @Index()
  userId!: string;

  @ManyToOne(() => Work, (work) => work.favorites, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  work!: Work;

  @Column({ type: 'uuid' })
  @Index()
  workId!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
