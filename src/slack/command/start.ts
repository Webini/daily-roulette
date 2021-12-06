import { Middleware, SlackCommandMiddlewareArgs } from '@slack/bolt/dist/types';
import DailyConfigurationService from '../../service/dailyConfiguration';
import DailyScheduler from '../../service/dailyScheduler';

const start: Middleware<SlackCommandMiddlewareArgs> = async ({
  client,
  body,
  ack,
}) => {
  await ack();
  const daily = await DailyConfigurationService.get({
    channelId: body.channel_id,
    enterpriseId: body.enterprise_id,
    teamId: body.team_id,
  });

  if (!daily) {
    await client.chat.postMessage({
      channel: body.user_id,
      text: `Daily roulette not installed in <#${body.channel_id}>`,
    });
    return;
  }

  await DailyScheduler.begin(daily);
};

export default start;
