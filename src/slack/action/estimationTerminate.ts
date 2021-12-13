import type {
  ButtonAction,
  Middleware,
  BlockAction,
  SlackActionMiddlewareArgs,
} from '@slack/bolt/dist/types';
import Estimations from '../../service/estimations';

const estimationTerminate: Middleware<
  SlackActionMiddlewareArgs<BlockAction<ButtonAction>>
> = async ({ body, ack, payload, respond }) => {
  await ack();
  await respond({ delete_original: true });

  if (!body.channel) {
    return;
  }

  const estimation = Estimations.get(payload.block_id);
  if (!estimation) {
    return;
  }

  if (estimation.conf.channelId !== body.channel.id) {
    return;
  }

  if (!estimation.canTerminate(body.user.id)) {
    return;
  }

  await estimation.terminate();
};

export default estimationTerminate;
