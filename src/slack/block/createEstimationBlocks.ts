import type { Block, KnownBlock } from '@slack/types';
import { VoteOption } from './createEstimationVoteBlocks';

type EstimationParams = {
  name: string;
  votes: { [key: string]: VoteOption };
  members: string[];
};

export const createEstimationText = ({
  name,
  votes,
  members,
}: EstimationParams) => {
  const hasVotedUsers = Object.keys(votes);
  const usersList = members
    .filter((u) => !hasVotedUsers.includes(u))
    .map((u) => `<@${u}>`);

  return `:mega: It's time to estimate *${name}* !\n It still need the vote of ${
    usersList.length > 0
      ? `${usersList.join(', ')} before the end ! :eyes: `
      : ''
  } `;
};

const createEstimationBlocks = (
  params: EstimationParams,
): (KnownBlock | Block)[] => [
  {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: createEstimationText(params),
    },
  },
];

export default createEstimationBlocks;
