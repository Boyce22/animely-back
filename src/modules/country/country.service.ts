import { Logger } from 'pino';
import { CountryRepository } from '@/modules/country/country.repository';
import { QueryCountriesInput } from '@/modules/country/schemas/query-countries.schema';
import { BadRequestError, NotFoundError } from '@errors';

interface AddressInput {
  countryId?: number;
  stateId?: number;
  cityId?: number;
  timeZoneId?: number;
}

export class CountryService {
  constructor(
    private readonly countryRepository: CountryRepository,
    private readonly logger: Logger,
  ) {}

  async getCountries(query: QueryCountriesInput) {
    return this.countryRepository.findAllCursor(query);
  }

  async getCountryByIso(iso: string) {
    const country = await this.countryRepository.findByIso(iso);

    if (!country) {
      throw new NotFoundError('Country not found');
    }

    return country;
  }

  async getStatesByCountry(countryId: number) {
    return this.countryRepository.findStatesByCountryId(countryId);
  }

  async getCitiesByState(stateId: number) {
    return this.countryRepository.findCitiesByStateId(stateId);
  }

  async validateAndBuildAddress(address?: AddressInput): Promise<string | null> {
    if (!address || this.isAddressEmpty(address)) {
      return null;
    }

    const parts: string[] = [];

    if (address.cityId) {
      const cityName = await this.validateCity(address.cityId, address.stateId);
      parts.push(cityName);
    }

    if (address.stateId) {
      const stateName = await this.validateState(address.stateId, address.countryId);
      parts.push(stateName);
    }

    if (address.countryId) {
      const countryName = await this.validateCountry(address.countryId);
      parts.push(countryName);
    }

    return parts.join(', ');
  }

  private isAddressEmpty(address: AddressInput): boolean {
    return !address.countryId && !address.stateId && !address.cityId && !address.timeZoneId;
  }

  private async validateCity(cityId: number, expectedStateId?: number): Promise<string> {
    const city = await this.countryRepository.findCityById(cityId);

    if (!city) {
      throw new NotFoundError(`City with id ${cityId} not found`);
    }

    if (expectedStateId && city.stateId !== expectedStateId) {
      throw new BadRequestError('City does not belong to the specified state');
    }

    return city.name;
  }

  private async validateState(stateId: number, expectedCountryId?: number): Promise<string> {
    const state = await this.countryRepository.findStateById(stateId);

    if (!state) {
      throw new NotFoundError(`State with id ${stateId} not found`);
    }

    if (expectedCountryId && state.countryId !== expectedCountryId) {
      throw new BadRequestError('State does not belong to the specified country');
    }

    return state.name;
  }

  private async validateCountry(countryId: number): Promise<string> {
    const country = await this.countryRepository.findCountryById(countryId);

    if (!country) {
      throw new NotFoundError(`Country with id ${countryId} not found`);
    }

    return country.name;
  }
}
