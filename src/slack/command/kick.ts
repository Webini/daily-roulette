import { Middleware, SlackCommandMiddlewareArgs } from '@slack/bolt/dist/types';
import DailyScheduler from '../../service/dailyScheduler';

const kick: Middleware<SlackCommandMiddlewareArgs> = async ({
  ack,
  body,
  client,
}) => {
  await ack();
  const instance = await DailyScheduler.getInstance({
    channelId: body.channel_id,
    enterpriseId: body.enterprise_id,
    teamId: body.team_id,
  });

  if (!instance) {
    await client.chat.postMessage({
      channel: body.user_id,
      text: `To kick someone, a daily meeting must be started in <#${body.channel_id}>`,
    });
    return;
  }

  if (!instance.canStartVoteKick()) {
    await client.chat.postMessage({
      channel: body.user_id,
      text: 'Cannot start vote kick now',
    });
    return;
  }

  await instance.startVoteKick();
};

export default kick;
