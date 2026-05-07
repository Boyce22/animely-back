import { UUID } from '@/shared/utils/uuid';
import { Entity, ManyToOne, CreateDateColumn, PrimaryColumn, Column, Index } from 'typeorm';
import { User } from '@/modules/user/entities/user.entity';

@Entity('user_follows')
@Index(['followerId', 'followingId'], { unique: true })
export class UserFollow {
  @PrimaryColumn('uuid')
  id: string = UUID.generate();

  @ManyToOne(() => User, (user) => user.following, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  follower!: User;

  @Column({ type: 'uuid' })
  @Index()
  followerId!: string;

  @ManyToOne(() => User, (user) => user.followers, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  following!: User;

  @Column({ type: 'uuid' })
  @Index()
  followingId!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
