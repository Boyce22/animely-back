import { Work } from '@/modules/work/entities/work.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

@Entity('manga_details')
export class MangaDetails {
  @PrimaryColumn('uuid', { name: 'work_id' })
  workId!: string;

  @OneToOne(() => Work, (work) => work.mangaDetails, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'work_id' })
  work!: Work;

  @Column({ type: 'int', nullable: true })
  chapterCount?: number;

  @Column({ type: 'int', nullable: true })
  volumeCount?: number;
}
