import { Middleware, SlackActionMiddlewareArgs } from '@slack/bolt/dist/types';
import { BlockAction } from '@slack/bolt/dist/types/actions/block-action';
import DailyScheduler from '../../service/dailyScheduler';

const kick: Middleware<SlackActionMiddlewareArgs<BlockAction>> = async ({
  body,
  ack,
  respond,
  payload,
}) => {
  await ack();

  if (!body.channel) {
    await respond({ delete_original: true });
    return;
  }

  const instance = DailyScheduler.getInstance({
    channelId: body.channel.id,
    enterpriseId: body.enterprise?.id,
    teamId: body.team?.id,
  });

  if (!instance) {
    await respond({ delete_original: true });
    return;
  }

  if (
    !instance.canVoteKick({
      userId: body.user.id,
      blockId: payload.block_id,
    })
  ) {
    return;
  }

  await instance.voteKick({
    userId: body.user.id,
    kick: payload.action_id === 'droulette-daily-kick',
  });
};

export default kick;
