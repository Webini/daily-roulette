import type { Block, KnownBlock } from '@slack/types';
import { VoteOption } from './createEstimationVoteBlocks';

const getSmileyForOffset = (offset: number) => {
  if (offset === 0) {
    return ':first_place_medal: ';
  }
  if (offset === 1) {
    return ':second_place_medal: ';
  }
  if (offset === 2) {
    return ':third_place_medal: ';
  }
  return '';
};

const createEstimationResultBlocks = ({
  name,
  results,
}: {
  name: string;
  results: { votes: number; users: string[]; option: VoteOption }[];
}): (KnownBlock | Block)[] => [
  {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `:bar_chart: *Results for ${name}*`,
    },
  },
  {
    type: 'divider',
  },
  {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: results
        .map(
          (result, i) =>
            `${getSmileyForOffset(i)}[*${result.option}*] ${result.users
              .map((u) => `<@${u}>`)
              .join(', ')}`,
        )
        .join('\n'),
    },
  },
];

export default createEstimationResultBlocks;
