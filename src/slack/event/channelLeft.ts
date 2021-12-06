import { Middleware, SlackEventMiddlewareArgs } from '@slack/bolt/dist/types';
import DailyConfigurationService from '../../service/dailyConfiguration';
import DailyScheduler from '../../service/dailyScheduler';

const channelLeft: Middleware<
  SlackEventMiddlewareArgs<'channel_left'>
> = async ({ body, payload }) => {
  const daily = await DailyConfigurationService.get({
    channelId: payload.channel,
    enterpriseId: body.enterprise_id,
    teamId: body.team_id,
  });
  if (!daily) {
    return;
  }

  const dailyInst = await DailyScheduler.getInstance({
    channelId: payload.channel,
    enterpriseId: body.enterprise_id,
    teamId: body.team_id,
  });
  if (dailyInst) {
    await dailyInst.stop();
  }
  await DailyConfigurationService.remove(daily);
};

export default channelLeft;
