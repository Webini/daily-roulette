import type { App } from '@slack/bolt';
import configure from './configure';
import remove from './remove';
import start from './start';
import stop from './stop';
import estimate from './estimate';

const bindCommands = (slack: App) => {
  slack.command('/droulette-configure', configure);
  slack.command('/droulette-remove', remove);
  slack.command('/droulette-start', start);
  slack.command('/droulette-stop', stop);
  slack.command('/droulette-estimate', estimate);
};

export default bindCommands;
