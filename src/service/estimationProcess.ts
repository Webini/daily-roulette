import { WebClient } from '@slack/web-api';
import EventEmitter from 'events';
import { inspect } from 'util';
import DailyConfiguration from '../entity/dailyConfiguration';
import createRandomString from '../utils/createRandomString';
import shuffle from '../utils/shuffle';
import parallelPromise, { ParallelPromiseType } from '../utils/parallelPromise';
import createEstimationVoteBlocks, {
  VoteOption,
} from '../slack/block/createEstimationVoteBlocks';
import createEstimationTerminateBlocks from '../slack/block/createEstimationTerminateBlocks';
import createEstimationBlocks from '../slack/block/createEstimationBlocks';
import createEstimationResultBlocks from '../slack/block/createEstimationResultBlocks';
import createDebug from '../utils/createDebug';

const debug = createDebug('estimation');
const DEFAULT_DURATION = 10 * 60; // 10 minutes

class EstimationProcess extends EventEmitter {
  private client: WebClient;

  public conf: DailyConfiguration;

  public id: string;

  private readonly name: string;

  private readonly adminId: string;

  private messageTs: string | null = null;

  private readonly channelId: string;

  private readonly duration: number = DEFAULT_DURATION;

  private members: string[] = [];

  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  private votes: { [key: string]: VoteOption } = {};

  constructor({
    adminId,
    conf,
    name,
    channelId,
    duration = DEFAULT_DURATION,
  }: {
    duration?: number;
    adminId: string;
    conf: DailyConfiguration;
    name: string;
    channelId: string;
  }) {
    super();
    this.conf = conf;
    this.adminId = adminId;
    this.name = name;
    this.channelId = channelId;
    this.client = new WebClient(this.conf.workspace.installation.bot?.token);
    this.id = createRandomString(32);
    this.duration = duration;
  }

  async start() {
    const result = await this.client.conversations.members({
      channel: this.conf.channelId,
    });
    this.members = shuffle(
      result.members?.filter(
        (member) =>
          !this.conf.disabledMembers.includes(member) &&
          member !== this.conf.workspace.installation.bot?.userId,
      ) || [],
    );

    const res = await this.client.chat.postMessage({
      channel: this.channelId,
      blocks: createEstimationBlocks({
        name: this.name,
        members: this.members,
        votes: this.votes,
      }),
    });
    this.messageTs = res.ts || null;

    this.timeoutId = setTimeout(() => this.onTimeout(), this.duration * 1000);
    await parallelPromise({
      data: this.members,
      promiseMethod: ParallelPromiseType.ALL_SETTLED,
      processor: async (userId) => {
        await this.client.chat.postEphemeral({
          user: userId,
          channel: this.channelId,
          blocks: createEstimationVoteBlocks({ userId, blockId: this.id }),
        });
        if (userId === this.adminId) {
          await this.client.chat.postEphemeral({
            user: userId,
            channel: this.channelId,
            blocks: createEstimationTerminateBlocks({ blockId: this.id }),
          });
        }
      },
    });

    this.emit('started');
    debug('Started %s', this.id);
  }

  canVote(userId: string) {
    if (!this.members.includes(userId)) {
      return false;
    }
    return true;
  }

  async vote({ userId, option }: { userId: string; option: VoteOption }) {
    this.votes[userId] = option;
    this.emit('voted', { userId, option }, this);

    if (Object.keys(this.votes).length === this.members.length) {
      await this.terminate();
      return null;
    }

    await this.client.chat.update({
      channel: this.channelId,
      ts: this.messageTs!,
      blocks: createEstimationBlocks({
        name: this.name,
        members: this.members,
        votes: this.votes,
      }),
    });

    debug('User %s vote %s in %s ', userId, option, this.id);

    return createEstimationVoteBlocks({
      selectedVote: option,
      blockId: this.id,
      userId,
    });
  }

  canTerminate(userId: string) {
    return userId === this.adminId;
  }

  async terminate() {
    const histogram = Object.entries(
      Object.entries(this.votes).reduce<
        Partial<{ [key in VoteOption]: { count: number; users: string[] } }>
      >((histo, [user, vote]) => {
        /* eslint-disable no-param-reassign */
        if (typeof histo[vote] !== 'number') {
          histo[vote] = { count: 0, users: [] };
        }
        histo[vote]!.count += 1;
        histo[vote]!.users.push(user);
        /* eslint-enable no-param-reassign */
        return histo;
      }, {}),
    )
      .sort((a, b) => a[1].count - b[1].count)
      .map(([option, { count: votes, users }]) => ({
        option: option as VoteOption,
        votes,
        users,
      }));

    await this.client.chat.postMessage({
      channel: this.channelId,
      blocks: createEstimationResultBlocks({
        name: this.name,
        results: histogram,
      }),
    });

    this.emit('terminated', this);
    this.destruct();
    debug('Estimation %s terminated with %o', this.id, histogram);
  }

  async onTimeout() {
    this.timeoutId = null;
    await this.terminate();
  }

  destruct() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}

export default EstimationProcess;
