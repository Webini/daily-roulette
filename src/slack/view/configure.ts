import { Middleware, SlackViewMiddlewareArgs } from '@slack/bolt/dist/types';
import { ViewSubmitAction } from '@slack/bolt/dist/types/view';
import DailyConfigurationService from '../../service/dailyConfiguration';
import DailyConfiguration from '../../service/dailyConfiguration';

type Day =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

type StateType = {
  channel: {
    'conversation-action': {
      selected_conversation: string;
    };
  };
  users: {
    'users-action': {
      selected_users: string[];
    };
  };
  time: {
    'timepicker-action': {
      selected_time: string;
    };
  };
  enabledDays: {
    'enabledDays-action': {
      selected_options: {
        value: Day;
      }[];
    };
  };
};

const configure: Middleware<
  SlackViewMiddlewareArgs<ViewSubmitAction>
> = async ({ ack, respond, payload, client, body, ...params }) => {
  const values = payload.state.values as unknown as StateType;
  const channelId = values.channel['conversation-action'].selected_conversation;
  const enabledDays = values.enabledDays[
    'enabledDays-action'
  ].selected_options.reduce<
    Partial<{
      [key in Day]: boolean;
    }>
  >((prev, options) => {
    // eslint-disable-next-line no-param-reassign
    prev[options.value] = true;
    return prev;
  }, {});

  // used to check if bot is in chan
  const conversationInfo = await client.conversations.info({
    channel: channelId,
  });
  if (!conversationInfo) {
    throw new Error(`Cannot found channel ${channelId}`);
  }

  if (!conversationInfo.channel?.is_member) {
    await client.conversations.join({ channel: channelId });
  }

  // retrieve user tz & install daily meeting bot
  const userInfo = await client.users.info({ user: body.user.id });
  await DailyConfiguration.upsert({
    channelId,
    enterpriseId: body.enterprise?.id,
    teamId: body.team?.id,
    createdBy: body.user.id,
    timezone: userInfo.user?.tz || 'Europe/Paris',
    time: values.time['timepicker-action'].selected_time,
    disabledMembers: values.users['users-action'].selected_users,
    ...enabledDays,
  });

  await ack();
  await client.chat.postMessage({
    channel: body.user.id,
    text: `Daily configured for <#${values.channel['conversation-action'].selected_conversation}>!`,
  });
};

export default configure;
