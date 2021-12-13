import type {
  ButtonAction,
  Middleware,
  SlackActionMiddlewareArgs,
  BlockAction,
} from '@slack/bolt/dist/types';
import Estimations from '../../service/estimations';
import { VoteOption } from '../block/createEstimationVoteBlocks';

const estimationVote: Middleware<
  SlackActionMiddlewareArgs<BlockAction<ButtonAction>>
> = async ({ body, ack, payload, respond }) => {
  await ack();

  if (!body.channel) {
    return;
  }

  const estimation = Estimations.get(payload.block_id);
  if (!estimation) {
    await respond({ delete_original: true });
    return;
  }

  if (estimation.conf.channelId !== body.channel.id) {
    await respond({ delete_original: true });
    return;
  }

  if (!estimation.canVote(body.user.id)) {
    await respond({ delete_original: true });
    return;
  }

  const blocks = await estimation.vote({
    userId: body.user.id,
    option: payload.value as VoteOption,
  });

  if (blocks) {
    await respond({ blocks, replace_original: true });
  } else {
    await respond({ delete_original: true });
  }
};

export default estimationVote;
