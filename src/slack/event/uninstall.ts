import { Middleware, SlackEventMiddlewareArgs } from '@slack/bolt/dist/types';
import WorkspaceService from '../../service/workspace';

const uninstall: Middleware<
  SlackEventMiddlewareArgs<'app_uninstalled'>
> = async (evt) => {
  await WorkspaceService.uninstall({
    enterpriseId: evt.body.enterprise_id,
    teamId: evt.body.team_id,
  });
};

export default uninstall;
