const instances = [];
const Estimations = {
  getOne({
    estimationId,
    channelId,
    enterpriseId,
    teamId,
  }: {
    estimationId: string;
    channelId: string;
    enterpriseId?: string | null;
    teamId?: string | null;
  }) {},

  create({
    name,
    channelId,
    enterpriseId,
    teamId,
    adminId,
  }: {
    name: string;
    adminId: string;
    channelId: string;
    enterpriseId?: string | null;
    teamId?: string | null;
  }) {},

  remove({
    channelId,
    enterpriseId,
    teamId,
    estimationId,
  }: {
    channelId: string;
    enterpriseId?: string | null;
    teamId?: string | null;
    estimationId: string;
  }) {},
};
