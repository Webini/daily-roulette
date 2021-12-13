import { App } from '@slack/bolt';
import next from './next';

const bindActions = (slack: App) => {
  slack.action('droulette-daily-next', next);
};

export default bindActions;
