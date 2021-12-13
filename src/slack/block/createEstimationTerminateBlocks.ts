import type { Block, KnownBlock } from '@slack/types';

const createEstimationTerminateBlocks = ({
  blockId,
}: {
  blockId: string;
}): (KnownBlock | Block)[] => [
  {
    type: 'section',
    text: {
      type: 'plain_text',
      text: `To manually terminate the estimation, click on the button bellow. It will automatically terminate once everyone has voted.`,
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
          text: 'Terminate',
        },
        style: 'danger',
        value: 'terminate',
        action_id: 'droulette-estimation-terminate',
      },
    ],
  },
];

export default createEstimationTerminateBlocks;
