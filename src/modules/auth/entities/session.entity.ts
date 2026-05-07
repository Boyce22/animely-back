import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { UUID } from '@/shared/utils/uuid';
import { User } from '@/modules/user/entities/user.entity';

@Entity('sessions')
export class Session {
  @PrimaryColumn('uuid')
  id: string = UUID.generate();

  @Index()
  @Column()
  userId!: string;

  @Column({ select: false })
  refreshTokenHash!: string;

  @Column({ type: 'timestamptz' })
  expiresAt!: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;
}
