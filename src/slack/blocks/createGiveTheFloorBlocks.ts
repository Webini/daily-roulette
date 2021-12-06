import type { Block, KnownBlock } from '@slack/types';

const createGiveTheFloorBlocks = ({
  blockId,
  hasNext,
}: {
  blockId: string;
  hasNext: boolean;
}): (KnownBlock | Block)[] => [
  {
    type: 'section',
    text: {
      type: 'plain_text',
      text: hasNext
        ? "Once you're finished click on the button bellow to select a new speaker"
        : "Once you're finished click on the button bellow to finish the daily",
      emoji: true,
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
          text: hasNext ? 'Give the floor' : 'Terminate',
        },
        action_id: 'droulette-daily-next',
      },
    ],
  },
];

export default createGiveTheFloorBlocks;
