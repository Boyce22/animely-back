import { City as CSC_City, State as CSC_State, Country as CSC_Country } from 'country-state-city';

import { logger } from '@utils';
import { AppDataSource } from '@config';
import { City } from '@/modules/country/entities/city.entity';
import { State } from '@/modules/country/entities/state.entity';
import { Country } from '@/modules/country/entities/country.entity';

type Manager = typeof AppDataSource.manager;

const CITY_BATCH_SIZE = 1000;

function mapTimeZones(timezones: any[] = []) {
  return timezones.map((tz) => ({
    name: tz.zoneName,
    abbreviation: tz.abbreviation,
    gmtOffset: tz.gmtOffset,
    gmtOffsetName: tz.gmtOffsetName,
    tzName: tz.tzName,
    zoneName: tz.zoneName,
  }));
}

function mapCities(cities: ReturnType<typeof CSC_City.getCitiesOfState>, stateId: number) {
  return cities.map((city) => ({
    name: city.name,
    stateId,
    latitude: city.latitude ? parseFloat(city.latitude) : undefined,
    longitude: city.longitude ? parseFloat(city.longitude) : undefined,
  }));
}

async function seedCities(manager: Manager, stateId: number, countryIso: string, stateIso: string) {
  const cities = CSC_City.getCitiesOfState(countryIso, stateIso);
  if (!cities.length) return;

  for (let i = 0; i < cities.length; i += CITY_BATCH_SIZE) {
    const batch = mapCities(cities.slice(i, i + CITY_BATCH_SIZE), stateId);
    await manager.insert(City, batch);
  }
}

async function seedStates(manager: Manager, countryId: number, countryIso: string) {
  const states = CSC_State.getStatesOfCountry(countryIso);

  for (const state of states) {
    const savedState = await manager.save(State, {
      name: state.name,
      countryId,
    });

    await seedCities(manager, savedState.id, countryIso, state.isoCode);
  }
}

export async function seedLocations(): Promise<void> {
  const countries = CSC_Country.getAllCountries();

  logger.info(`Seeding ${countries.length} countries...`);

  for (const country of countries) {
    await AppDataSource.manager.transaction(async (manager) => {
      const savedCountry = await manager.save(Country, {
        name: country.name,
        iso: country.isoCode,
        timeZones: mapTimeZones(country.timezones),
      });

      await seedStates(manager, savedCountry.id, country.isoCode);
    });

    logger.info(`Seeded: ${country.name}`);
  }

  logger.info('Location seed complete');
}
