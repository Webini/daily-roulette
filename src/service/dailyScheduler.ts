import DailyConfigurationService from './dailyConfiguration';
import DailyConfiguration from '../entity/dailyConfiguration';
import DailyProcess from './dailyProcess';
import createDebug from '../utils/createDebug';

const debug = createDebug('daily-scheduler');

const DEFAULT_TIMEOUT = 2 * 60 * 60 * 1000; // timeout (2h)

class DailySchedulerClass {
  private watchIntervalInSec: number;

  private interval: ReturnType<typeof setInterval> | null = null;

  private dailies: DailyProcess[] = [];

  constructor(watchIntervalInSec = 10) {
    this.watchIntervalInSec = watchIntervalInSec;
  }

  public destruct() {
    this.stop();
    // this.dailies = [];
  }

  public stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  public start() {
    this.stop();
    this.interval = setInterval(
      () => this.watch(),
      this.watchIntervalInSec * 1000,
    );
  }

  private async watch() {
    const upcomingDailies = await DailyConfigurationService.getUpcoming();
    debug(
      'Upcoming dailies - %o',
      upcomingDailies.map((d) => d.id),
    );
    for (let i = 0, sz = upcomingDailies.length; i < sz; i++) {
      await this.begin(upcomingDailies[i]);
    }

    debug(
      'Current dailies %o',
      this.dailies.map((d) => d.conf.id),
    );
    const now = Date.now();
    for (let i = 0, sz = this.dailies.length; i < sz; i++) {
      const daily = this.dailies[i];
      const executedAt = daily.conf.lastExecutedAt?.getTime();
      if (!executedAt) {
        return;
      }
      if (now - executedAt > DEFAULT_TIMEOUT) {
        debug('Daily %d expired', daily.conf.id);
        await daily.stop();
      }
    }
  }

  public getInstance({
    channelId,
    enterpriseId = null,
    teamId = null,
  }: {
    channelId: string;
    enterpriseId?: string | null;
    teamId?: string | null;
  }) {
    return this.dailies.find(
      (d) =>
        d.conf.channelId === channelId &&
        d.conf.workspace.teamId === teamId &&
        d.conf.workspace.enterpriseId === enterpriseId,
    );
  }

  public async begin(entity: DailyConfiguration) {
    const found = this.dailies.find((d) => d.conf.id === entity.id);
    if (found) {
      return false;
    }

    const daily = new DailyProcess(entity);
    await daily.init();
    this.dailies.push(daily);
    const onStopped = () => {
      this.dailies = this.dailies.filter((d) => d.conf.id !== entity.id);
      daily.removeAllListeners();
    };

    daily.on('stopped', onStopped);
    await daily.start();
    return true;
  }
}

const DailyScheduler = new DailySchedulerClass();
export default DailyScheduler;
