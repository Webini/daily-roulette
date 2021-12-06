import { getRepository, Raw } from 'typeorm';
import { utcToZonedTime, format, zonedTimeToUtc } from 'date-fns-tz';
import DailyConfiguration from '../entity/dailyConfiguration';
import createDebug from '../utils/createDebug';
import WorkspaceService from './workspace';

const debug = createDebug('daily-configuration-service');
const ONE_DAY_IN_SEC = 24 * 60 * 60;

type DailyDayKeys = Extract<
  keyof DailyConfiguration,
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
>;
const dayNoToDailyKey: DailyDayKeys[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

const DailyConfigurationService = {
  async get({
    channelId,
    enterpriseId,
    teamId,
  }: {
    channelId: string;
    enterpriseId?: string;
    teamId?: string;
  }) {
    const workspace = await WorkspaceService.get({ enterpriseId, teamId });
    if (!workspace) {
      return null;
    }

    return getRepository(DailyConfiguration).findOne({ workspace, channelId });
  },
  async upsert({
    channelId,
    enterpriseId,
    teamId,
    createdBy,
    timezone,
    time,
    disabledMembers,
    monday,
    tuesday,
    wednesday,
    thursday,
    friday,
    saturday,
    sunday,
  }: Pick<
    DailyConfiguration,
    'time' | 'disabledMembers' | 'timezone' | 'createdBy'
  > &
    Partial<
      Pick<
        DailyConfiguration,
        | 'monday'
        | 'tuesday'
        | 'wednesday'
        | 'thursday'
        | 'friday'
        | 'saturday'
        | 'sunday'
      >
    > & { channelId: string; enterpriseId?: string; teamId?: string }) {
    const existingConf = await this.get({ enterpriseId, teamId, channelId });
    const workspace = await WorkspaceService.get({ enterpriseId, teamId });
    const conf = existingConf || new DailyConfiguration();

    if (!workspace) {
      throw new Error(`Workspace not found for ${enterpriseId} - ${teamId}`);
    }

    conf.workspace = workspace;
    conf.time = time;
    conf.disabledMembers = disabledMembers;
    conf.timezone = timezone;
    conf.channelId = channelId;
    conf.createdBy = createdBy;
    conf.monday = !!monday;
    conf.tuesday = !!tuesday;
    conf.wednesday = !!wednesday;
    conf.thursday = !!thursday;
    conf.friday = !!friday;
    conf.saturday = !!saturday;
    conf.sunday = !!sunday;

    await getRepository(DailyConfiguration).save(conf);
    return conf;
  },
  /**
   * Get next start for given daily
   */
  getNextStart(daily: DailyConfiguration, from: Date = new Date()) {
    const zonedNow = utcToZonedTime(from.toISOString(), daily.timezone);
    const zonedDate = format(zonedNow, 'yyyy-MM-dd', {
      timeZone: daily.timezone,
    });

    const isEnabledForZonedDay = daily[dayNoToDailyKey[zonedNow.getDay()]];
    if (!isEnabledForZonedDay) {
      return null;
    }

    const utcUpcomingDatetime = zonedTimeToUtc(
      `${zonedDate}T${daily.time}:00`,
      daily.timezone,
    );
    return utcUpcomingDatetime;
  },
  /**
   * Get upcoming dailies
   */
  async getUpcoming(from: Date = new Date()) {
    const repo = getRepository(DailyConfiguration);

    // This should be done in raw sql but sqlite lack of good timezone support
    const allDailies = await repo.find({
      lastExecutedAt: Raw(
        (alias) =>
          `${alias} IS NULL OR strftime('%s', datetime(:date)) - strftime('%s', ${alias}) > ${ONE_DAY_IN_SEC}`,
        { date: from.toISOString() },
      ),
    });
    const upcomingDailies: DailyConfiguration[] = allDailies.filter((daily) => {
      const nextStart = this.getNextStart(daily, from);
      if (!nextStart) {
        debug('Ignore daily id %d with %o', daily.id, { from, nextStart });
        return false;
      }

      const isUpcoming = from >= nextStart;
      if (!isUpcoming) {
        debug('Ignore daily id %d with %o - upcoming', daily.id, {
          from,
          nextStart,
        });
      }
      return isUpcoming;
    });

    return upcomingDailies;
  },
  /**
   * Flag daily as started in db
   */
  async start(daily: DailyConfiguration) {
    const repo = getRepository(DailyConfiguration);
    const now = new Date();
    /* eslint-disable no-param-reassign */
    daily.startedAt = now;
    daily.lastExecutedAt = now;
    /* eslint-enable no-param-reassign */
    await repo.save(daily);
  },
  /**
   * Flag daily as stopped in db
   */
  async stop(daily: DailyConfiguration) {
    const repo = getRepository(DailyConfiguration);
    /* eslint-disable-next-line no-param-reassign */
    daily.finishedAt = new Date();
    await repo.save(daily);
  },
  /**
   * Remove daily conf
   */
  async remove(daily: DailyConfiguration) {
    await getRepository(DailyConfiguration).remove(daily);
  },
};

export default DailyConfigurationService;
