import 'reflect-metadata';
import path from 'path';
import { createConnection as originalCreateConnection } from 'typeorm';
import { ConnectionOptions } from 'typeorm/connection/ConnectionOptions';
import Workspace from './entity/workspace';
import DailyConfiguration from './entity/dailyConfiguration';

export const createConfiguration = (
  options: Partial<ConnectionOptions> = {},
): ConnectionOptions => {
  const databasePath = process.env.SQLITE_PATH;
  if (!databasePath) {
    throw new Error('SQLITE_PATH env var missing');
  }
  return {
    ...options,
    type: 'sqlite',
    database: databasePath,
    entities: [Workspace, DailyConfiguration],
    migrations: [`${path.resolve(__dirname, './migration')}/**/*.[tj]s`],
    synchronize: false,
    logging: process.env.DEBUG_QUERIES === 'true',
  };
};

const createConnection = async (options: Partial<ConnectionOptions> = {}) =>
  originalCreateConnection(createConfiguration(options));

export default createConnection;
