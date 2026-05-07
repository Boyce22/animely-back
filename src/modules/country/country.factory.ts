import pino from 'pino';

import { AppDataSource } from '@config';

import { City } from '@/modules/country/entities/city.entity';
import { State } from '@/modules/country/entities/state.entity';
import { Country } from '@/modules/country/entities/country.entity';

import { CountryService } from '@/modules/country/country.service';

import { CountryController } from '@/modules/country/country.controller';
import { CountryRepository } from '@/modules/country/country.repository';

const logger = pino({ name: 'country-module' });

const countryRepository = new CountryRepository(
  AppDataSource.getRepository(Country),
  AppDataSource.getRepository(State),
  AppDataSource.getRepository(City),
);

export const countryService = new CountryService(countryRepository, logger);
const countryController = new CountryController(countryService);

export const countryRouter = countryController.router;
