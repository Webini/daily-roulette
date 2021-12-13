import type { Block, KnownBlock } from '@slack/types';
import { VoteOption } from './createEstimationVoteBlocks';

const createEstimationBlocks = ({
  name,
  votes,
  members,
}: {
  name: string;
  votes: { [key: string]: VoteOption };
  members: string[];
}): (KnownBlock | Block)[] => {
  const hasVotedUsers = Object.keys(votes);
  const usersList = members
    .filter((u) => !hasVotedUsers.includes(u))
    .map((u) => `<@${u}>`);

  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `:mega: It's time to estimate *${name}* !\n It still need the vote of ${
          usersList.length > 0
            ? `${usersList.join(', ')} before the end ! :eyes: `
            : ''
        } `,
      },
    },
  ];
};

export default createEstimationBlocks;
