import { Middleware, SlackActionMiddlewareArgs } from '@slack/bolt/dist/types';
import { BlockAction } from '@slack/bolt/dist/types/actions/block-action';
import DailyScheduler from '../../service/dailyScheduler';

const next: Middleware<SlackActionMiddlewareArgs<BlockAction>> = async ({
  body,
  ack,
  respond,
  client,
  payload,
}) => {
  await ack();
  await respond({ delete_original: true });

  if (!body.channel) {
    return;
  }

  const instance = DailyScheduler.getInstance({
    channelId: body.channel.id,
    enterpriseId: body.enterprise?.id,
    teamId: body.team?.id,
  });

  if (!instance) {
    return;
  }

  if (
    !instance.hasNextPrivilege({
      userId: body.user.id,
      blockId: payload.block_id,
    })
  ) {
    await client.chat.postMessage({
      channel: body.user.id,
      text: ':stuck_out_tongue_winking_eye:',
    });
    return;
  }

  await instance.next();
};

export default next;
