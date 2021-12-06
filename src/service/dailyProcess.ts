import { WebClient } from '@slack/web-api';
import EventEmitter from 'events';
import { userInfo } from 'os';
import DailyConfiguration from '../entity/dailyConfiguration';
import DailyConfigurationService from './dailyConfiguration';
import createRandomString from '../utils/createRandomString';
import createDebug from '../utils/createDebug';
import createGiveTheFloorBlocks from '../slack/blocks/createGiveTheFloorBlocks';
import parallelPromise from '../utils/parallelPromise';
import createKickBlocks from '../slack/blocks/createKickBlocks';

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

  private instanceId: string;

  private kickInstanceId: string | null = null;

  private kickValidated: string[] = [];

  private kickMessageTs: string | null = null;

  constructor(conf: DailyConfiguration) {
    super();
    this.conf = conf;
    this.instanceId = createRandomString(16);
  }

  public async init() {
    this.client = new WebClient(this.conf.workspace.installation.bot?.token);
    const result = await this.client.conversations.members({
      channel: this.conf.channelId,
    });

    this.state = STATE.INITIALIZED;
    this.availableMembers =
      result.members
        ?.filter(
          (member) =>
            !this.conf.disabledMembers.includes(member) &&
            member !== this.conf.workspace.installation.bot?.userId,
        )
        .sort(() => Math.random() * 2 - 1) || [];
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

  public hasNextPrivilege({
    userId,
    blockId,
  }: {
    userId?: string;
    blockId?: string;
  }) {
    if (this.state !== STATE.STARTED) {
      debug('Instance is not started');
      return false;
    }
    if (
      this.currentMemberOffset >= 0 &&
      userId &&
      userId !== this.availableMembers[this.currentMemberOffset]
    ) {
      debug(
        'Invalid user id %s vs current %s',
        userId,
        this.availableMembers[this.currentMemberOffset],
      );
      return false;
    }
    if (blockId && blockId !== this.instanceId) {
      debug('Invalid block id %s vs %s', blockId, this.instanceId);
      return false;
    }
    return true;
  }

  private getKickMinVotesCount() {
    return Math.max(Math.floor(this.availableMembers.length / 2), 1);
  }

  public canStartVoteKick() {
    if (this.state !== STATE.STARTED) {
      return false;
    }
    return true;
  }

  public async startVoteKick() {
    const talkingUser = this.availableMembers[this.currentMemberOffset];
    this.kickInstanceId = createRandomString(16);
    const result = await this.client!.chat.postMessage({
      channel: this.conf.channelId,
      blocks: createKickBlocks({
        votes: 0,
        minVotesCount: this.getKickMinVotesCount(),
        blockId: this.kickInstanceId!,
        proposalUserId: talkingUser,
      }),
    });
    this.kickMessageTs = result.ts || null;
  }

  private async resetVoteKick() {
    debug('Reset votekick messages %o', this.kickMessageTs);
    if (this.kickMessageTs) {
      await this.client!.chat.delete({
        channel: this.conf.channelId,
        ts: this.kickMessageTs,
      });
      this.kickMessageTs = null;
    }
    this.kickValidated = [];
  }

  private async updateVoteKickMessages() {
    const votes = this.kickValidated.length;
    debug('Update votekick messages %o', this.kickMessageTs);
    if (this.kickMessageTs) {
      await this.client!.chat.update({
        channel: this.conf.channelId,
        ts: this.kickMessageTs,
        blocks: createKickBlocks({
          votes,
          minVotesCount: this.getKickMinVotesCount(),
          blockId: this.kickInstanceId!,
          proposalUserId: this.availableMembers[this.currentMemberOffset],
        }),
      });
    }
  }

  public canVoteKick({ userId, blockId }: { userId: string; blockId: string }) {
    if (this.state !== STATE.STARTED) {
      debug('Invalid instance state, it must be started');
      return false;
    }
    if (blockId !== this.kickInstanceId) {
      debug(
        "Can't kick invalid block id %s - %s",
        blockId,
        this.kickInstanceId,
      );
      return false;
    }
    if (this.kickValidated.includes(userId)) {
      debug('User %s already voted to eject user', userId);
      return false;
    }
    return true;
  }

  public async voteKick({ userId, kick }: { userId: string; kick: boolean }) {
    debug('Vote kick %o from %s -- %o', kick, userId, this.kickValidated);
    if (!kick) {
      return;
    }

    this.kickValidated.push(userId);

    const votes = this.kickValidated.length;
    const minVoters = this.getKickMinVotesCount();

    if (votes >= minVoters) {
      debug(
        'User %s kicked (%d / %d)',
        this.availableMembers[this.currentMemberOffset],
        votes,
        minVoters,
      );
      // post message shame on kickers
      await this.next();
      return;
    }

    await this.updateVoteKickMessages();
  }

  public async next() {
    if (!STATE.STARTED) {
      throw new Error('DailyConfiguration should be started');
    }

    const nextOffset = this.currentMemberOffset + 1;
    if (nextOffset >= this.availableMembers.length) {
      await this.stop();
      return false;
    }

    await this.resetVoteKick();
    this.currentMemberOffset = nextOffset;
    const memberId = this.availableMembers[this.currentMemberOffset];
    await this.client!.chat.postMessage({
      channel: this.conf.channelId,
      text: `It's <@${memberId}>'s turn !`,
    });

    const hasNext = this.currentMemberOffset + 1 < this.availableMembers.length;

    await this.client!.chat.postEphemeral({
      channel: this.conf.channelId,
      user: this.availableMembers[this.currentMemberOffset],
      // text: "Once you're finished click on the button bellow to finish the daily",
      blocks: createGiveTheFloorBlocks({
        blockId: this.instanceId,
        hasNext,
      }),
    });

    this.emit('next', this);
    return true;
  }

  public async stop() {
    if (this.state !== STATE.STARTED) {
      throw new Error('DailyProcess should be started before stopped');
    }
    this.state = STATE.FINISHED;
    await DailyConfigurationService.stop(this.conf);
    await this.resetVoteKick();
    await this.client!.chat.postMessage({
      channel: this.conf.channelId,
      text: `Daily meeting finished ! Have a nice day :smiley:`,
    });
    this.emit('stopped', this);
  }
}

export default DailyProcess;
