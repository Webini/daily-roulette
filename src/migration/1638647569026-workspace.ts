import { MigrationInterface, QueryRunner } from 'typeorm';

export class workspace1638647569026 implements MigrationInterface {
  name = 'workspace1638647569026';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "Workspace" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, 
        "teamId" varchar(250), 
        "enterpriseId" varchar(250), 
        "installation" text NOT NULL, 
        "createdAt" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, 
        CONSTRAINT "UQ_4d1eceef7e5f8e70fe3ead745d9" UNIQUE ("teamId"), 
        CONSTRAINT "UQ_3a34161c56e549d78b28e14d937" UNIQUE ("entrepriseId")
      )`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_4d1eceef7e5f8e70fe3ead745d" ON "workspace" ("teamId") `);
    await queryRunner.query(`CREATE INDEX "IDX_3a34161c56e549d78b28e14d93" ON "workspace" ("entrepriseId") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_3a34161c56e549d78b28e14d93"`);
    await queryRunner.query(`DROP INDEX "IDX_4d1eceef7e5f8e70fe3ead745d"`);
    await queryRunner.query(`DROP TABLE "Workspace"`);
  }
}
