import dotenv from 'dotenv';
import { createConfiguration } from './src/database';

dotenv.config();

export default createConfiguration({
  synchronize: true,
  // logging: false,
  // entities: ['src/entity/**/*.ts'],
  // migrations: ['src/migration/**/*.ts'],
  // subscribers: ['src/subscriber/**/*.ts'],
  cli: {
    entitiesDir: 'src/entity',
    migrationsDir: 'src/migration',
    subscribersDir: 'src/subscriber',
  },
});
