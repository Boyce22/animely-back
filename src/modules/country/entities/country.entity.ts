import { State } from '@/modules/country/entities/state.entity';
import { TimeZone } from '@/modules/country/entities/time-zone.entity';

import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index } from 'typeorm';

@Entity('countries')
export class Country {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @Index()
  name!: string;

  @Column({ length: 3, unique: true })
  iso!: string;

  @OneToMany(() => State, (state) => state.country)
  states!: State[];

  @OneToMany(() => TimeZone, (timeZone) => timeZone.country, { cascade: true })
  timeZones!: TimeZone[];
}
