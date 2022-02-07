import { Middleware, SlackCommandMiddlewareArgs } from '@slack/bolt/dist/types';
import DailyConfigurationService from '../../service/dailyConfiguration';

const remove: Middleware<SlackCommandMiddlewareArgs> = async ({
  client,
  body,
  ack,
}) => {
  const daily = await DailyConfigurationService.get({
    channelId: body.channel_id,
    enterpriseId: body.enterprise_id,
    teamId: body.team_id,
  });

  if (!daily) {
    await ack();
    await client.chat.postMessage({
      channel: body.user_id,
      text: `Daily roulette not installed in <#${body.channel_id}>`,
    });
    return;
  }

  await client.conversations.leave({
    channel: body.channel_id,
  });

  await client.chat.postMessage({
    channel: body.user_id,
    text: `Daily roulette removed from <#${body.channel_id}>`,
  });
  await ack();
};

export default remove;
