import { City } from '@/modules/country/entities/city.entity';
import { Country } from '@/modules/country/entities/country.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, Index } from 'typeorm';

@Entity('states')
export class State {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @Index()
  name!: string;

  @ManyToOne(() => Country, (country) => country.states, { onDelete: 'CASCADE' })
  country!: Country;

  @Column()
  countryId!: number;

  @OneToMany(() => City, (city) => city.state)
  cities!: City[];
}
