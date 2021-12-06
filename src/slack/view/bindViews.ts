import { App } from '@slack/bolt';
import configure from './configure';

const bindViews = (slack: App) => {
  slack.view('droulette-configure', configure);
};

export default bindViews;
