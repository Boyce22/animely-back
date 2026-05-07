import { UUID } from '@/shared/utils/uuid';
import {
  Entity,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  Index,
} from 'typeorm';

import { Collection } from '@/modules/work/entities/collection.entity';
import { Work } from '@/modules/work/entities/work.entity';
import { CollectionStatus } from '@/modules/work/enums/collection-status';

@Entity('collection_entries')
@Index(['collectionId', 'workId'], { unique: true })
@Index(['collectionId', 'position'])
export class CollectionEntry {
  @PrimaryColumn('uuid')
  id: string = UUID.generate();

  @Column({ type: 'int' })
  position!: number;

  @Column({ type: 'enum', enum: CollectionStatus })
  status!: CollectionStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => Collection, (collection) => collection.entries, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  collection!: Collection;

  @Column({ type: 'uuid' })
  @Index()
  collectionId!: string;

  @ManyToOne(() => Work, (work) => work.collectionEntries, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  work!: Work;

  @Column({ type: 'uuid' })
  @Index()
  workId!: string;
}
