import { Middleware, SlackCommandMiddlewareArgs } from '@slack/bolt/dist/types';
import type { PlainTextOption } from '@slack/bolt';
import { Channel } from '@slack/web-api/dist/response/ConversationsInfoResponse';
import DailyConfigurationService from '../../service/dailyConfiguration';

const configure: Middleware<SlackCommandMiddlewareArgs> = async ({
  ack,
  say,
  body,
  ...rest
}) => {
  await ack();
  const {
    channel_id: channelId,
    enterprise_id: enterpriseId,
    team_id: teamId,
  } = body;
  const conf = await DailyConfigurationService.get({
    channelId,
    enterpriseId,
    teamId,
  });

  let conversationInfo: Channel | null = null;
  try {
    conversationInfo =
      (
        await rest.client.conversations.info({
          channel: channelId,
          include_locale: true,
        })
      ).channel || null;
    // eslint-disable-next-line no-empty
  } catch (e) {}

  const isChannelAccessible = conversationInfo?.is_channel;
  const options: { [key: string]: PlainTextOption } = {
    monday: {
      value: 'monday',
      text: {
        type: 'plain_text',
        text: 'Monday',
      },
    },
    tuesday: {
      value: 'tuesday',
      text: {
        type: 'plain_text',
        text: 'Tuesday',
      },
    },
    wednesday: {
      value: 'wednesday',
      text: {
        type: 'plain_text',
        text: 'Wednesday',
      },
    },
    thursday: {
      value: 'thursday',
      text: {
        type: 'plain_text',
        text: 'Thursday',
      },
    },
    friday: {
      value: 'friday',
      text: {
        type: 'plain_text',
        text: 'Friday',
      },
    },
    saturday: {
      value: 'saturday',
      text: {
        type: 'plain_text',
        text: 'Saturday',
      },
    },
    sunday: {
      value: 'sunday',
      text: {
        type: 'plain_text',
        text: 'Sunday',
      },
    },
  };

  const selectedDays = [
    conf?.monday && 'monday',
    conf?.tuesday && 'tuesday',
    conf?.wednesday && 'wednesday',
    conf?.thursday && 'thursday',
    conf?.friday && 'friday',
    conf?.saturday && 'saturday',
    conf?.sunday && 'sunday',
  ]
    .filter(Boolean)
    .map((name) => options[name as keyof typeof options]);
  await rest.client.views.open({
    trigger_id: body.trigger_id,
    view: {
      type: 'modal',
      callback_id: 'droulette-configure',
      title: {
        type: 'plain_text',
        text: 'DailyRoulette',
        emoji: true,
      },
      submit: {
        type: 'plain_text',
        text: 'Submit',
        emoji: true,
      },
      close: {
        type: 'plain_text',
        text: 'Cancel',
        emoji: true,
      },
      blocks: [
        {
          type: 'section',
          text: {
            type: 'plain_text',
            text: 'Please configure daily roulette bot',
            emoji: true,
          },
        },
        {
          type: 'input',
          block_id: 'channel',
          label: {
            type: 'plain_text',
            text: 'Select channel',
          },
          element: {
            type: 'conversations_select',
            action_id: 'conversation-action',
            placeholder: {
              type: 'plain_text',
              text: 'Channel name',
            },
            initial_conversation: isChannelAccessible ? channelId : undefined,
            filter: {
              exclude_bot_users: true,
              include: ['public'],
            },
          },
        },
        {
          type: 'input',
          block_id: 'users',
          optional: true,
          label: {
            type: 'plain_text',
            emoji: true,
            text: 'Select excluded users',
          },
          element: {
            type: 'multi_users_select',
            placeholder: {
              type: 'plain_text',
              text: 'Select users',
              emoji: true,
            },
            action_id: 'users-action',
            initial_users: conf?.disabledMembers || [],
          },
        },
        {
          type: 'input',
          block_id: 'time',
          element: {
            type: 'timepicker',
            initial_time: conf?.time,
            placeholder: {
              type: 'plain_text',
              text: 'Select time',
              emoji: true,
            },
            action_id: 'timepicker-action',
          },
          label: {
            type: 'plain_text',
            text: 'Startup time',
            emoji: true,
          },
        },
        {
          type: 'input',
          block_id: 'enabledDays',
          element: {
            type: 'checkboxes',
            initial_options: selectedDays.length > 0 ? selectedDays : undefined,
            options: Object.values(options),
            action_id: 'enabledDays-action',
          },
          label: {
            type: 'plain_text',
            text: 'Select days',
            emoji: true,
          },
        },
      ],
    },
  });
};

export default configure;
