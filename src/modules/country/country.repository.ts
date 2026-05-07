import { Repository } from 'typeorm';
import { Country } from '@/modules/country/entities/country.entity';
import { State } from '@/modules/country/entities/state.entity';
import { City } from '@/modules/country/entities/city.entity';
import { QueryCountriesInput } from '@/modules/country/schemas/query-countries.schema';

export class CountryRepository {
  constructor(
    private readonly countryRepo: Repository<Country>,
    private readonly stateRepo: Repository<State>,
    private readonly cityRepo: Repository<City>,
  ) {}

  async findByIso(iso: string): Promise<Country | null> {
    return this.countryRepo.findOne({
      where: { iso: iso.toUpperCase() },
    });
  }

  async findStateById(stateId: number): Promise<State | null> {
    return this.stateRepo.findOne({
      where: { id: stateId },
    });
  }

  async findCityById(cityId: number): Promise<City | null> {
    return this.cityRepo.findOne({
      where: { id: cityId },
    });
  }

  async findCountryById(countryId: number): Promise<Country | null> {
    return this.countryRepo.findOne({
      where: { id: countryId },
    });
  }

  async findAllCursor(query: QueryCountriesInput) {
    const { cursor, limit, search, order } = query;

    const qb = this.countryRepo
      .createQueryBuilder('country')
      .orderBy('country.id', order === 'asc' ? 'ASC' : 'DESC')
      .take(limit + 1);

    if (cursor) {
      const op = order === 'asc' ? '>' : '<';
      qb.where(`country.id ${op} :cursor`, { cursor });
    }

    if (search) {
      qb.andWhere('(country.name ILIKE :search OR country.iso = :iso)', {
        search: `%${search}%`,
        iso: search.toUpperCase(),
      });
    }

    const data = await qb.getMany();
    const hasNext = data.length > limit;
    if (hasNext) data.pop();

    return {
      data,
      nextCursor: hasNext ? data[data.length - 1].id : null,
    };
  }

  async findStatesByCountryId(countryId: number): Promise<State[]> {
    return this.stateRepo
      .createQueryBuilder('state')
      .where('state.countryId = :countryId', { countryId })
      .orderBy('state.name', 'ASC')
      .getMany();
  }

  async findCitiesByStateId(stateId: number): Promise<City[]> {
    return this.cityRepo
      .createQueryBuilder('city')
      .where('city.stateId = :stateId', { stateId })
      .orderBy('city.name', 'ASC')
      .getMany();
  }
}
