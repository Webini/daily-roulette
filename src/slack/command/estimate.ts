import { Middleware, SlackCommandMiddlewareArgs } from '@slack/bolt/dist/types';
import DailyConfigurationService from '../../service/dailyConfiguration';
import Estimations from '../../service/estimations';

const estimate: Middleware<SlackCommandMiddlewareArgs> = async ({
  client,
  body,
  payload,
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

  if (!payload.text || payload.text.trim().length <= 0) {
    await client.chat.postMessage({
      channel: body.user_id,
      text: 'You must describe or set the the ticket id to estimate',
    });
    return;
  }

  const estimation = Estimations.create({
    name: payload.text,
    channelId: payload.channel_id,
    conf: daily,
    adminId: payload.user_id,
  });

  estimation.start().catch((e) => {
    console.error(e);
    // @todo sentry
  });
};

export default estimate;
