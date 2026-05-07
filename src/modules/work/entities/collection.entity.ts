import { UUID } from '@/shared/utils/uuid';
import { User } from '@/modules/user/entities/user.entity';
import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryColumn,
  Index,
} from 'typeorm';

import { CollectionEntry } from '@/modules/work/entities/collection-entry.entity';

@Entity('collections')
export class Collection {
  @PrimaryColumn('uuid')
  id: string = UUID.generate();

  @Column({ length: 255 })
  @Index()
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ length: 500, nullable: true })
  coverUrl?: string;

  @Column({ default: true })
  isPublic!: boolean;

  /**
   * When true, this collection was curated by an admin and can be
   * surfaced on the home screen as a featured playlist.
   */
  @Column({ default: false })
  isFeatured!: boolean;

  @Column({ type: 'int', default: 0 })
  workCount!: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt?: Date;

  @ManyToOne(() => User, (user) => user.collections, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  createdBy?: User;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  createdById?: string;

  @OneToMany(() => CollectionEntry, (entry) => entry.collection, { cascade: ['insert', 'update'] })
  entries!: CollectionEntry[];
}
