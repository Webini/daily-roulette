import type { Block, KnownBlock } from '@slack/types';

type GiveTheFloorParamsType = {
  hasAction?: boolean;
  blockId: string;
  talkingUserId: string;
  hasNext: boolean;
};

export const createGiveTheFloorText = ({
  talkingUserId,
  hasNext,
  hasAction,
  short,
}: Omit<GiveTheFloorParamsType, 'blockId'> & { short?: boolean }) => {
  const nextText = hasNext
    ? 'Once finished click on the button bellow to select a new speaker'
    : 'Once finished click on the button bellow to terminate the daily';
  return `It's <@${talkingUserId}>'s turn !${
    !short && hasAction ? `\n${nextText}` : ''
  }`;
};

const createGiveTheFloorBlocks = ({
  blockId,
  talkingUserId,
  hasNext,
  hasAction,
}: GiveTheFloorParamsType): (KnownBlock | Block)[] => [
  {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: createGiveTheFloorText({ hasNext, hasAction, talkingUserId }),
    },
  },
  ...(hasAction
    ? ([
        {
          type: 'actions',
          block_id: blockId,
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: hasNext ? 'Next speaker' : 'Terminate',
              },
              action_id: 'droulette-daily-next',
            },
          ],
        },
      ] as (KnownBlock | Block)[])
    : []),
];

export default createGiveTheFloorBlocks;
