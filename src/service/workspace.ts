import { getRepository, IsNull } from 'typeorm';
import type { Installation } from '@slack/oauth';
import Workspace from '../entity/workspace';
import createDebug from '../utils/createDebug';

const debug = createDebug('workspace-service');

const WorkspaceService = {
  async install({
    enterpriseId = null,
    teamId = null,
    installation,
  }: {
    enterpriseId?: string | null;
    teamId?: string | null;
    installation: Installation;
  }) {
    debug(
      'Install enterpriseId %s - teamId %s -- %O',
      enterpriseId,
      teamId,
      installation,
    );
    const repo = getRepository(Workspace);
    let workspace = await this.get({
      enterpriseId: enterpriseId || undefined,
      teamId: teamId || undefined,
    });

    if (workspace) {
      debug(
        'Workspace already existing for enterpriseId %s - teamId %s',
        enterpriseId,
        teamId,
      );
      workspace.installation = installation;
      await repo.save(workspace);
      return workspace;
    }
    workspace = new Workspace();
    workspace.teamId = teamId;
    workspace.enterpriseId = enterpriseId;
    workspace.installation = installation;
    return repo.save(workspace);
  },
  async uninstall(data: { enterpriseId?: string; teamId?: string }) {
    debug(
      'Uninstall enterpriseId %s - teamId %s',
      data.enterpriseId,
      data.teamId,
    );
    const workspace = await this.get(data);
    if (!workspace) {
      return false;
    }

    await getRepository(Workspace).remove(workspace);
    return true;
  },
  async getById(id: number) {
    return getRepository(Workspace).findOne({ id });
  },
  async get({
    enterpriseId,
    teamId,
  }: {
    enterpriseId?: string;
    teamId?: string;
  }) {
    debug('Retrieve enterpriseId %s - teamId %s', enterpriseId, teamId);
    return getRepository(Workspace).findOne({
      enterpriseId: !enterpriseId ? IsNull() : enterpriseId,
      teamId: !teamId ? IsNull() : teamId,
    });
  },
};

export default WorkspaceService;
