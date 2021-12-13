import { WebClient } from '@slack/web-api';
import EventEmitter from 'events';
import { userInfo } from 'os';
import DailyConfiguration from '../entity/dailyConfiguration';
import DailyConfigurationService from './dailyConfiguration';
import createRandomString from '../utils/createRandomString';
import createDebug from '../utils/createDebug';
import createGiveTheFloorBlocks from '../slack/block/createGiveTheFloorBlocks';
import parallelPromise from '../utils/parallelPromise';
import createKickBlocks from '../slack/block/createKickBlocks';
import shuffle from '../utils/shuffle';

const debug = createDebug('daily-process');
const alphaSort = (a: string, b: string) => {
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
};

export enum STATE {
  INITIALIZING = 'INITIALIZING',
  INITIALIZED = 'INITIALIZED',
  STARTED = 'STARTED',
  FINISHED = 'FINISHED',
}

class DailyProcess extends EventEmitter {
  private client: WebClient | null = null;

  public conf: DailyConfiguration;

  private availableMembers: string[] = [];

  private currentMemberOffset = -1;

  private state: STATE = STATE.INITIALIZING;

  private nextBlockId: string;

  private currentMessageTs: string | null = null;

  constructor(conf: DailyConfiguration) {
    super();
    this.conf = conf;
    this.nextBlockId = createRandomString(16);
  }

  public async init() {
    this.client = new WebClient(this.conf.workspace.installation.bot?.token);
    const result = await this.client.conversations.members({
      channel: this.conf.channelId,
    });

    this.state = STATE.INITIALIZED;
    this.availableMembers = shuffle(
      result.members?.filter(
        (member) =>
          !this.conf.disabledMembers.includes(member) &&
          member !== this.conf.workspace.installation.bot?.userId,
      ) || [],
    );
    this.emit('initialized', this);
  }

  public async start() {
    if (this.state === STATE.INITIALIZING) {
      throw new Error('DailyProcess should be initialized');
    }
    await DailyConfigurationService.start(this.conf);
    this.state = STATE.STARTED;
    this.currentMemberOffset = -1;
    this.emit('started', this);

    const members = [...this.availableMembers]
      .sort(alphaSort)
      .map((id) => `<@${id}>`)
      .join(', ');

    await this.client!.chat.postMessage({
      channel: this.conf.channelId,
      text: `:eyes: Daily meeting time :call_me_hand: ${members} be ready !`,
    });
    await this.next();
  }

  public canNext({ blockId }: { blockId?: string }) {
    if (this.state !== STATE.STARTED) {
      debug('Instance is not started');
      return false;
    }
    if (blockId && blockId !== this.nextBlockId) {
      debug('Invalid block id %s vs %s', blockId, this.nextBlockId);
      return false;
    }
    return true;
  }

  public async next() {
    if (!STATE.STARTED) {
      throw new Error('DailyConfiguration should be started');
    }
    const oldBlockId = this.nextBlockId;
    this.nextBlockId = createRandomString(16);

    const nextOffset = this.currentMemberOffset + 1;
    if (nextOffset >= this.availableMembers.length) {
      await this.stop();
      return false;
    }

    if (this.currentMessageTs) {
      const ts = this.currentMessageTs;
      this.currentMessageTs = null;
      await this.client!.chat.update({
        channel: this.conf.channelId,
        ts,
        blocks: createGiveTheFloorBlocks({
          blockId: oldBlockId,
          talkingUserId: this.availableMembers[this.currentMemberOffset],
          hasNext: this.currentMemberOffset + 1 < this.availableMembers.length,
        }),
      });
    }

    this.currentMemberOffset = nextOffset;
    const memberId = this.availableMembers[this.currentMemberOffset];
    const hasNext = this.currentMemberOffset + 1 < this.availableMembers.length;
    const res = await this.client!.chat.postMessage({
      channel: this.conf.channelId,
      blocks: createGiveTheFloorBlocks({
        blockId: this.nextBlockId,
        talkingUserId: memberId,
        hasNext,
        hasAction: true,
      }),
    });
    this.currentMessageTs = res.ts || null;

    this.emit('next', this);
    return true;
  }

  public async stop() {
    if (this.state !== STATE.STARTED) {
      throw new Error('DailyProcess should be started before stopped');
    }
    this.state = STATE.FINISHED;
    await DailyConfigurationService.stop(this.conf);

    const ts = this.currentMessageTs;
    this.currentMessageTs = null;
    if (ts) {
      await this.client!.chat.update({
        channel: this.conf.channelId,
        ts,
        blocks: createGiveTheFloorBlocks({
          blockId: this.nextBlockId,
          talkingUserId: this.availableMembers[this.currentMemberOffset],
          hasNext: false,
          hasAction: false,
        }),
      });
    }

    await this.client!.chat.postMessage({
      channel: this.conf.channelId,
      text: `Daily meeting finished ! Have a nice day :smiley:`,
    });
    this.emit('stopped', this);
  }
}

export default DailyProcess;
