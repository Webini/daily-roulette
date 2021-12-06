import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  OneToMany,
} from 'typeorm';
import type { Installation } from '@slack/oauth';
import DailyConfiguration from './dailyConfiguration';

@Entity('Workspace')
class Workspace {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ type: 'varchar', nullable: true, length: 250, unique: true })
  teamId!: string | null;

  @Index()
  @Column({ type: 'varchar', nullable: true, length: 250, unique: true })
  enterpriseId!: string | null;

  @Column({
    type: 'simple-json',
    nullable: false,
  })
  installation!: Installation;

  @Column({
    type: 'datetime',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  @OneToMany(() => DailyConfiguration, (conf) => conf.workspace, {
    cascade: ['insert', 'remove', 'update'],
  })
  dailies!: Promise<DailyConfiguration[]>;
}

export default Workspace;
