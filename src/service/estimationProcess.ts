import { WebClient } from '@slack/web-api';
import DailyConfiguration from '../entity/dailyConfiguration';
import createRandomString from '../utils/createRandomString';
import shuffle from '../utils/shuffle';
import parallelPromise from '../utils/parallelPromise';

const DEFAULT_DURATION = 10 * 60; // 10 minutes
type EstimationOption =
  | ':coffee:'
  | '1'
  | '2'
  | '3'
  | '5'
  | '8'
  | '13'
  | '21'
  | '34'
  | '55'
  | '89'
  | '?';
const estimationOption: EstimationOption[] = [
  ':coffee:',
  '1',
  '2',
  '3',
  '5',
  '8',
  '13',
  '21',
  '34',
  '55',
  '89',
  '?',
];

class EstimationProcess {
  private client: WebClient;

  public conf: DailyConfiguration;

  public id: string;

  private name: string;

  private adminId: string;

  private messageTs: string | null = null;

  private readonly channelId: string;

  private duration: number = DEFAULT_DURATION;

  private members: string[] = [];

  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  private votes: { [key: string]: EstimationOption } = {};

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
      text: `Estimation for ${this.name}`,
    });

    this.timeoutId = setTimeout(() => this.onTimeout(), this.duration * 1000);

    await parallelPromise({
      data: this.members,
      processor: async (userID) => {
        await this.client.chat.postEphemeral({
          user: userID,
          channel: this.channelId,
          blocks: [],
        });
        if (userID === this.adminId) {
          // @todo add terminate estimation option
        }
      },
    });
    this.messageTs = res.ts || null;
  }

  canVote(userId: string) {
    if (!this.members.includes(userId)) {
      return false;
    }
    if (this.votes[userId]) {
      return false;
    }
    return true;
  }

  async vote({ userId, option }: { userId: string; option: EstimationOption }) {
    this.votes[userId] = option;
  }

  canTerminate(userId: string) {
    return userId === this.adminId;
  }

  async terminate() {}

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
