import { UUID } from '@/shared/utils/uuid';
import { User } from '@/modules/user/entities/user.entity';
import {
  Entity,
  Column,
  ManyToOne,
  CreateDateColumn,
  PrimaryColumn,
  Index,
} from 'typeorm';

export enum SanctionType {
  BAN = 'BAN',
  SUSPENSION = 'SUSPENSION',
}

export enum SanctionReason {
  HARASSMENT = 'HARASSMENT',
  SPAM = 'SPAM',
  INAPPROPRIATE_CONTENT = 'INAPPROPRIATE_CONTENT',
  IMPERSONATION = 'IMPERSONATION',
  CHEATING = 'CHEATING',
  OTHER = 'OTHER',
}

@Entity('user_sanctions')
export class UserSanction {
  @PrimaryColumn('uuid')
  id: string = UUID.generate();

  @Column({ type: 'enum', enum: SanctionType })
  type!: SanctionType;

  @Column({ type: 'enum', enum: SanctionReason })
  reason!: SanctionReason;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  revokedAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  revokedById?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  revokedBy?: User;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.sanctions, { nullable: false, onDelete: 'CASCADE' })
  user!: User;

  @Column({ type: 'uuid' })
  @Index()
  userId!: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  issuedBy!: User;

  @Column({ type: 'uuid' })
  @Index()
  issuedById!: string;

  get isActive(): boolean {
    if (this.revokedAt) return false;
    if (!this.expiresAt) return true;
    return new Date() < this.expiresAt;
  }
}
