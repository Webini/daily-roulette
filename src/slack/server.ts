import { App, LogLevel } from '@slack/bolt';
import bindCommands from './command';
import WorkspaceService from '../service/workspace';
import bindEvents from './event';
import bindActions from './action';
import bindViews from './view/bindViews';

const createSlackServer = () => {
  const server = new App({
    // token: process.env.SLACK_BOT_TOKEN,
    // signingSecret: process.env.SLACK_SIGNING_SECRET,
    logLevel:
      process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.ERROR,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    clientId: process.env.SLACK_CLIENT_ID,
    clientSecret: process.env.SLACK_CLIENT_SECRET,
    stateSecret: process.env.SLACK_STATE_SECRET,
    scopes: ['chat:write', 'commands', 'channels:read', 'channels:join', 'users:read'],
    installationStore: {
      storeInstallation: async (installation) => {
        await WorkspaceService.install({
          enterpriseId: installation.enterprise?.id,
          teamId: installation.team?.id,
          installation,
        });
      },
      fetchInstallation: async (installQuery) => {
        const workspace = await WorkspaceService.get({
          enterpriseId: installQuery.enterpriseId,
          teamId: installQuery.teamId,
        });
        if (!workspace) {
          throw new Error(
            `Workspace not found for ${installQuery.enterpriseId}, ${installQuery.teamId}`,
          );
        }
        return workspace.installation;
      },
      deleteInstallation: async (installQuery) => {
        await WorkspaceService.uninstall({
          enterpriseId: installQuery.enterpriseId,
          teamId: installQuery.teamId,
        });
      },
    },
  });

  bindCommands(server);
  bindEvents(server);
  bindActions(server);
  bindViews(server);

  return server;
};

export default createSlackServer;
