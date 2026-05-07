import { UUID } from '@/shared/utils/uuid';
import { User } from '@/modules/user/entities/user.entity';

import {
  Entity,
  Column,
  ManyToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  Index,
  DeleteDateColumn,
} from 'typeorm';

import { Work } from '@/modules/work/entities/work.entity';
import { TagType } from '@/shared/enums/tag-type';

@Entity('tags')
export class Tag {
  @PrimaryColumn('uuid')
  id: string = UUID.generate();

  @Column({ length: 100, unique: true })
  @Index()
  name!: string;

  @Column({ length: 100, unique: true })
  @Index({ unique: true })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: TagType, default: TagType.GENRE })
  type!: TagType;

  @Column({ length: 7, nullable: true })
  color?: string; // hex color para UI

  // Timestamps
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt?: Date;

  // Estatísticas
  @Column({ type: 'int', default: 0 })
  usageCount!: number;

  // Relacionamentos
  @ManyToMany(() => Work, (work) => work.tags)
  works!: Work[];

  // Usuários responsáveis
  @ManyToOne(() => User, (user) => user.createdTags, { nullable: true })
  createdBy?: User;

  @Column({ type: 'uuid', nullable: true })
  createdById?: string;

  @ManyToOne(() => User, { nullable: true })
  updatedBy?: User;

  @Column({ type: 'uuid', nullable: true })
  updatedById?: string;
}
