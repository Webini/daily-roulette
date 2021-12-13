import type { Block, KnownBlock } from '@slack/types';

const createGiveTheFloorBlocks = ({
  blockId,
  talkingUserId,
  hasNext,
  hasAction,
}: {
  hasAction?: boolean;
  blockId: string;
  talkingUserId: string;
  hasNext: boolean;
}): (KnownBlock | Block)[] => {
  const nextText = hasNext
    ? 'Once finished click on the button bellow to select a new speaker'
    : 'Once finished click on the button bellow to terminate the daily';
  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `It's <@${talkingUserId}>'s turn !${
          hasAction ? `\n${nextText}` : ''
        }`,
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
};

export default createGiveTheFloorBlocks;
