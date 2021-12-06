import { App } from '@slack/bolt';
import uninstall from './uninstall';
import channelLeft from './channelLeft';

const bindEvents = (slack: App) => {
  slack.event('app_uninstalled', uninstall);
  slack.event('channel_left', channelLeft);
};

export default bindEvents;
