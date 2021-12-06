import type { Block, KnownBlock } from '@slack/types';

const createKickBlocks = ({
  votes,
  minVotesCount,
  blockId,
  proposalUserId,
}: {
  votes: number;
  minVotesCount: number;
  blockId: string;
  proposalUserId: string;
}): (KnownBlock | Block)[] => [
  {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `Kick vote for <@${proposalUserId}>, if ${minVotesCount} vote${
        minVotesCount > 1 ? 's' : ''
      } are reach, the floor will be given to someone else`,
    },
  },
  {
    type: 'section',
    text: {
      type: 'plain_text',
      emoji: true,
      text: `${votes} kick vote${votes > 1 ? 's' : ''}, ${
        minVotesCount - votes
      } until kick`,
    },
  },
  {
    type: 'actions',
    block_id: blockId,
    elements: [
      {
        type: 'button',
        text: {
          type: 'plain_text',
          emoji: true,
          text: 'Kick',
        },
        style: 'danger',
        value: 'kick',
        action_id: 'droulette-daily-kick',
      },
    ],
  },
];

export default createKickBlocks;
