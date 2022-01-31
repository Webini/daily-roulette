import type { Block, KnownBlock } from '@slack/types';
import { VoteOption } from './createEstimationVoteBlocks';

type EstimationResultParams = {
  name: string;
  results: { votes: number; users: string[]; option: VoteOption }[];
};

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

export const createEstimationResultTitle = ({
  name,
}: Pick<EstimationResultParams, 'name'>) => `:bar_chart: *Results for ${name}*`;

export const createEstimationResultContent = ({
  results,
}: Pick<EstimationResultParams, 'results'>) =>
  results
    .map(
      (result, i) =>
        `${getSmileyForOffset(i)}[*${result.option}*] ${result.users
          .map((u) => `<@${u}>`)
          .join(', ')}`,
    )
    .join('\n');

const createEstimationResultBlocks = ({
  name,
  results,
}: EstimationResultParams): (KnownBlock | Block)[] => [
  {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: createEstimationResultTitle({ name }),
    },
  },
  {
    type: 'divider',
  },
  {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: createEstimationResultContent({ results }),
    },
  },
];

export default createEstimationResultBlocks;
