import EstimationProcess from './estimationProcess';
import DailyConfiguration from '../entity/dailyConfiguration';
import createDebug from '../utils/createDebug';

const debug = createDebug('estimations');

const Estimations = {
  instances: [] as EstimationProcess[],

  get(id: string) {
    return this.instances.find((inst) => inst.id === id);
  },

  create({
    name,
    channelId,
    conf,
    adminId,
  }: {
    name: string;
    adminId: string;
    channelId: string;
    conf: DailyConfiguration;
    enterpriseId?: string | null;
    teamId?: string | null;
  }) {
    const instance = new EstimationProcess({
      adminId,
      name,
      channelId,
      conf,
    });
    const onTerminated = () => {
      this.instances = this.instances.filter(
        (current) => current.id !== instance.id,
      );
      instance.removeAllListeners();
      debug('Deleted estimation #%s', instance.id);
    };
    instance.on('terminated', onTerminated);
    debug('Created new estimation #%s', instance.id);
    this.instances.push(instance);
    return instance;
  },
};

export default Estimations;
