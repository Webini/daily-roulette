import ORM from 'typeorm';
import { mocked } from 'ts-jest/utils';
import DailyConfiguration from '../entity/dailyConfiguration';
import DailyConfigurationService from './dailyConfiguration';

jest.mock('typeorm', () => {
  const actual = jest.requireActual('typeorm');
  return {
    ...actual,
    getRepository: jest.fn(),
  };
});

const createDailyConfiguration = (
  data: Partial<{ [K in keyof DailyConfiguration]: DailyConfiguration[K] }>,
) =>
  Object.entries(data).reduce<DailyConfiguration>((daily, [key, value]) => {
    // @ts-ignore
    // eslint-disable-next-line no-param-reassign
    daily[key] = value;
    return daily;
  }, new DailyConfiguration());

describe('daily', () => {
  it('getNextStart should return null as tuesday is not allowed', () => {
    const dailyConf = createDailyConfiguration({
      time: '10:30',
      timezone: 'Indian/Reunion',
      monday: true,
    });
    const from = new Date('2021-07-05T23:00:00Z');
    const next = DailyConfigurationService.getNextStart(dailyConf, from);
    expect(next).toBe(null);
  });

  it('getNextStart should return tuesday', () => {
    const dailyConf = createDailyConfiguration({
      time: '10:30',
      timezone: 'Europe/Paris',
      monday: true,
      tuesday: true,
    });

    expect(
      DailyConfigurationService.getNextStart(
        dailyConf,
        new Date('2021-07-05T23:30:00Z'),
      )?.toISOString(),
    ).toBe('2021-07-06T08:30:00.000Z');

    // verify DST offset
    expect(
      DailyConfigurationService.getNextStart(
        dailyConf,
        new Date('2021-12-06T23:30:00Z'),
      )?.toISOString(),
    ).toBe('2021-12-07T09:30:00.000Z');
  });

  it('should handle tz', async () => {
    const findMock = jest.fn();
    mocked(ORM.getRepository).mockReturnValueOnce({
      find: findMock.mockResolvedValueOnce([
        createDailyConfiguration({
          id: 1,
          monday: true,
          time: '12:00',
          timezone: 'Indian/Reunion',
        }),
        createDailyConfiguration({
          id: 2,
          monday: true,
          time: '08:00',
          timezone: 'Indian/Reunion',
        }),
        createDailyConfiguration({
          id: 3,
          monday: true,
          sunday: true,
          time: '01:00',
          timezone: 'Europe/Paris',
        }),
      ]),
    } as any);

    const from = new Date('2021-12-06T08:00:00Z');
    const dailies = await DailyConfigurationService.getUpcoming(from);
    expect(findMock).toHaveBeenCalled();
    expect(dailies.map(({ id }) => id)).toEqual([1, 2, 3]);
  });
});
