import { App } from '@slack/bolt';
import next from './next';
import kick from './kick';

const bindActions = (slack: App) => {
  slack.action('droulette-daily-next', next);
  slack.action('droulette-daily-kick', kick);
};

export default bindActions;
