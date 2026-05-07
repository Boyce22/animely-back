import { DataSource } from 'typeorm';

import { env } from '@config';

const isProduction = env.NODE_ENV === 'production';

const CONFIG_PRODUCTION = {
  ENTITIES: ['dist/modules/**/entities/*.entity.js'],
  MIGRATIONS: ['dist/database/migrations/*.js'],
};

const CONFIG_DEV = {
  ENTITIES: ['src/modules/**/entities/*.entity.ts'],
  MIGRATIONS: ['src/database/migrations/*.ts'],
};

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.DB_HOST,
  port: Number(env.DB_PORT),
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_DATABASE,
  schema: env.DB_SCHEMA,
  logging: !isProduction,
  synchronize: false,
  entities: isProduction ? CONFIG_PRODUCTION.ENTITIES : CONFIG_DEV.ENTITIES,
  migrations: isProduction ? CONFIG_PRODUCTION.MIGRATIONS : CONFIG_DEV.MIGRATIONS,
  migrationsTableName: 'migrations',
});
