import { MigrationInterface, QueryRunner } from 'typeorm';

export class lastexecuted1643664248570 implements MigrationInterface {
  name = 'lastexecuted1643664248570';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "temporary_DailyConfiguration" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "time" varchar(250) NOT NULL, "channelId" varchar(250) NOT NULL, "timezone" varchar(250) NOT NULL, "monday" boolean NOT NULL DEFAULT (false), "tuesday" boolean NOT NULL DEFAULT (false), "wednesday" boolean NOT NULL DEFAULT (false), "thursday" boolean NOT NULL DEFAULT (false), "friday" boolean NOT NULL DEFAULT (false), "saturday" boolean NOT NULL DEFAULT (false), "sunday" boolean NOT NULL DEFAULT (false), "disabledMembers" text NOT NULL DEFAULT ('[]'), "startedAt" datetime, "finishedAt" datetime, "lastExecutedAt" datetime DEFAULT (CURRENT_TIMESTAMP), "createdBy" varchar(250) NOT NULL, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "workspaceId" integer NOT NULL, CONSTRAINT "FK_d04437ee42d1487e310ede357cf" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_DailyConfiguration"("id", "time", "channelId", "timezone", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", "disabledMembers", "startedAt", "finishedAt", "lastExecutedAt", "createdBy", "createdAt", "workspaceId") SELECT "id", "time", "channelId", "timezone", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", "disabledMembers", "startedAt", "finishedAt", "lastExecutedAt", "createdBy", "createdAt", "workspaceId" FROM "DailyConfiguration"`,
    );
    await queryRunner.query(`DROP TABLE "DailyConfiguration"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_DailyConfiguration" RENAME TO "DailyConfiguration"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "DailyConfiguration" RENAME TO "temporary_DailyConfiguration"`,
    );
    await queryRunner.query(
      `CREATE TABLE "DailyConfiguration" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "time" varchar(250) NOT NULL, "channelId" varchar(250) NOT NULL, "timezone" varchar(250) NOT NULL, "monday" boolean NOT NULL DEFAULT (false), "tuesday" boolean NOT NULL DEFAULT (false), "wednesday" boolean NOT NULL DEFAULT (false), "thursday" boolean NOT NULL DEFAULT (false), "friday" boolean NOT NULL DEFAULT (false), "saturday" boolean NOT NULL DEFAULT (false), "sunday" boolean NOT NULL DEFAULT (false), "disabledMembers" text NOT NULL DEFAULT ('[]'), "startedAt" datetime, "finishedAt" datetime, "lastExecutedAt" datetime, "createdBy" varchar(250) NOT NULL, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "workspaceId" integer NOT NULL, CONSTRAINT "FK_d04437ee42d1487e310ede357cf" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "DailyConfiguration"("id", "time", "channelId", "timezone", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", "disabledMembers", "startedAt", "finishedAt", "lastExecutedAt", "createdBy", "createdAt", "workspaceId") SELECT "id", "time", "channelId", "timezone", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", "disabledMembers", "startedAt", "finishedAt", "lastExecutedAt", "createdBy", "createdAt", "workspaceId" FROM "temporary_DailyConfiguration"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_DailyConfiguration"`);
  }
}
