import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  JoinTable,
} from 'typeorm';
import Workspace from './workspace';

@Entity('DailyConfiguration')
class DailyConfiguration {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Workspace, (workspace) => workspace.dailies, {
    nullable: false,
    onDelete: 'CASCADE',
    eager: true,
  })
  workspace!: Workspace;

  /**
   * Time with format HH:MM
   */
  @Column({ type: 'varchar', length: 250, nullable: false })
  time!: string;

  @Column({ type: 'varchar', length: 250, nullable: false })
  channelId!: string;

  @Column({ type: 'varchar', length: 250, nullable: false })
  timezone!: string;

  @Column({ type: 'boolean', nullable: false, default: () => 'false' })
  monday = false;

  @Column({ type: 'boolean', nullable: false, default: () => 'false' })
  tuesday = false;

  @Column({ type: 'boolean', nullable: false, default: () => 'false' })
  wednesday = false;

  @Column({ type: 'boolean', nullable: false, default: () => 'false' })
  thursday = false;

  @Column({ type: 'boolean', nullable: false, default: () => 'false' })
  friday = false;

  @Column({ type: 'boolean', nullable: false, default: () => 'false' })
  saturday = false;

  @Column({ type: 'boolean', nullable: false, default: () => 'false' })
  sunday = false;

  @Column({
    type: 'simple-json',
    nullable: false,
    default: () => "'[]'",
  })
  disabledMembers!: string[];

  @Column({ type: 'datetime', nullable: true })
  startedAt!: Date | null;

  @Column({ type: 'datetime', nullable: true })
  finishedAt!: Date | null;

  @Column({ type: 'datetime', nullable: true })
  lastExecutedAt!: Date | null;

  @Column({ type: 'varchar', length: 250, nullable: false })
  createdBy!: string;

  @Column({
    type: 'datetime',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;
}

export default DailyConfiguration;
