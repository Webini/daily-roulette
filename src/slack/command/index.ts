import { App } from '@slack/bolt';
import configure from './configure';
import remove from './remove';
import kick from './kick';
import start from './start';
import stop from './stop';

const bindCommands = (slack: App) => {
  slack.command('/droulette-configure', configure);
  slack.command('/droulette-remove', remove);
  slack.command('/droulette-kick', kick);
  slack.command('/droulette-start', start);
  slack.command('/droulette-stop', stop);
};

export default bindCommands;
