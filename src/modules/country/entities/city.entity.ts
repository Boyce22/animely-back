import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from 'typeorm';
import { State } from '@/modules/country/entities/state.entity';

@Entity('cities')
export class City {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @Index()
  name!: string;

  @ManyToOne(() => State, (state) => state.cities, { onDelete: 'CASCADE' })
  state!: State;

  @Column()
  stateId!: number;

  @Column({ type: 'decimal', nullable: true })
  latitude!: number;

  @Column({ type: 'decimal', nullable: true })
  longitude!: number;
}
