import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index, JoinColumn } from 'typeorm';
import { Country } from '@/modules/country/entities/country.entity';

@Entity('timezones')
@Index(['zoneName', 'countryId'], { unique: true })
export class TimeZone {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @Index()
  name!: string;

  @Column({ length: 10 })
  abbreviation!: string;

  @Column({ type: 'int' })
  gmtOffset!: number;

  @Column({ length: 20 })
  gmtOffsetName!: string;

  @Column()
  tzName!: string;

  @Column()
  zoneName!: string;

  @Column()
  countryId!: number;

  @ManyToOne(() => Country, (country) => country.timeZones, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'countryId' })
  country!: Country;
}
