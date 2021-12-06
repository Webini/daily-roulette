import dotenv from 'dotenv';
import path from 'path';
import { inspect } from 'util';
import { ErrorCode } from '@slack/bolt/dist/errors';
import createSlackServer from './slack/server';
import createConnection from './database';
import DailyScheduler from './service/dailyScheduler';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

(async () => {
  try {
    await createConnection();
    const server = createSlackServer();

    server.error(async (e) => {
      console.error('Slack error : ', inspect(e, { depth: 10 }));
      if (e.code === ErrorCode.AppInitializationError) {
        process.exit(1);
      }
    });

    await server.start(Number(process.env.PORT) || 3000);
    await DailyScheduler.start();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
