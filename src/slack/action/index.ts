import { App } from '@slack/bolt';
import next from './next';
import estimationTerminate from './estimationTerminate';
import estimationVote from './estimationVote';

const bindActions = (slack: App) => {
  slack.action('droulette-daily-next', next);
  slack.action('droulette-estimation-terminate', estimationTerminate);
  slack.action(/^droulette-estimation-vote-[0-9]+$/, estimationVote);
};

export default bindActions;
