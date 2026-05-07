import { Work } from '@/modules/work/entities/work.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

@Entity('anime_details')
export class AnimeDetails {
  @PrimaryColumn('uuid', { name: 'work_id' })
  workId!: string;

  @OneToOne(() => Work, (work) => work.animeDetails, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'work_id' })
  work!: Work;

  @Column({ type: 'int', nullable: true })
  episodeCount?: number;

  @Column({ type: 'int', nullable: true })
  durationMinutes?: number;

  @Column({ length: 50, nullable: true })
  season?: string;

  @Column({ type: 'int', nullable: true })
  seasonYear?: number;
}
