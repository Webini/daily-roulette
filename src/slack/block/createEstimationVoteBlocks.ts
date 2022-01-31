import type { Button, Block, KnownBlock } from '@slack/types';

export type VoteOption =
  | ':coffee:'
  | '1'
  | '2'
  | '3'
  | '5'
  | '8'
  | '13'
  | '21'
  | '34'
  | '55'
  | '89'
  | '?';
export const voteOptions: VoteOption[] = [
  '?',
  '1',
  '2',
  '3',
  '5',
  '8',
  '13',
  '21',
  '34',
  '55',
  '89',
  ':coffee:',
];

const createEstimationVoteBlocks = ({
  selectedVote,
  blockId,
}: {
  userId: string;
  selectedVote?: VoteOption;
  blockId: string;
}): (KnownBlock | Block)[] => [
  {
    type: 'actions',
    block_id: blockId,
    elements: voteOptions.map<Button>((option, i) => ({
      type: 'button',
      text: {
        type: 'plain_text',
        emoji: true,
        text: option,
      },
      style: selectedVote === option ? 'primary' : undefined,
      value: option,
      action_id: `droulette-estimation-vote-${i}`,
    })),
  },
];

export default createEstimationVoteBlocks;
