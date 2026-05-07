import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWorkDetailsSnakeCaseAndCollectionStatus1777239958494 implements MigrationInterface {
    name = 'AddWorkDetailsSnakeCaseAndCollectionStatus1777239958494'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "c0"."manga_details" DROP CONSTRAINT "FK_3252e63fe8ce649770e57f35e69"`);
        await queryRunner.query(`ALTER TABLE "c0"."anime_details" DROP CONSTRAINT "FK_21ab4364b15e81e739b47f02c73"`);
        await queryRunner.query(`ALTER TABLE "c0"."manga_details" RENAME COLUMN "workId" TO "work_id"`);
        await queryRunner.query(`ALTER TABLE "c0"."manga_details" RENAME CONSTRAINT "PK_3252e63fe8ce649770e57f35e69" TO "PK_b988df00b015c0d07e48e83499d"`);
        await queryRunner.query(`ALTER TABLE "c0"."anime_details" RENAME COLUMN "workId" TO "work_id"`);
        await queryRunner.query(`ALTER TABLE "c0"."anime_details" RENAME CONSTRAINT "PK_21ab4364b15e81e739b47f02c73" TO "PK_1db9f6353ac5d0745debb89e47f"`);
        await queryRunner.query(`CREATE TYPE "c0"."collection_entries_status_enum" AS ENUM('PLAN_TO_READ', 'READING', 'COMPLETED', 'ON_HOLD', 'DROPPED')`);
        await queryRunner.query(`ALTER TABLE "c0"."collection_entries" ADD "status" "c0"."collection_entries_status_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "c0"."collection_entries" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_b3aa10c29ea4e61a830362bd25" ON "c0"."tags" ("slug") `);
        await queryRunner.query(`ALTER TABLE "c0"."manga_details" ADD CONSTRAINT "FK_b988df00b015c0d07e48e83499d" FOREIGN KEY ("work_id") REFERENCES "c0"."works"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "c0"."anime_details" ADD CONSTRAINT "FK_1db9f6353ac5d0745debb89e47f" FOREIGN KEY ("work_id") REFERENCES "c0"."works"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "c0"."anime_details" DROP CONSTRAINT "FK_1db9f6353ac5d0745debb89e47f"`);
        await queryRunner.query(`ALTER TABLE "c0"."manga_details" DROP CONSTRAINT "FK_b988df00b015c0d07e48e83499d"`);
        await queryRunner.query(`DROP INDEX "c0"."IDX_b3aa10c29ea4e61a830362bd25"`);
        await queryRunner.query(`ALTER TABLE "c0"."collection_entries" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "c0"."collection_entries" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "c0"."collection_entries_status_enum"`);
        await queryRunner.query(`ALTER TABLE "c0"."anime_details" RENAME CONSTRAINT "PK_1db9f6353ac5d0745debb89e47f" TO "PK_21ab4364b15e81e739b47f02c73"`);
        await queryRunner.query(`ALTER TABLE "c0"."anime_details" RENAME COLUMN "work_id" TO "workId"`);
        await queryRunner.query(`ALTER TABLE "c0"."manga_details" RENAME CONSTRAINT "PK_b988df00b015c0d07e48e83499d" TO "PK_3252e63fe8ce649770e57f35e69"`);
        await queryRunner.query(`ALTER TABLE "c0"."manga_details" RENAME COLUMN "work_id" TO "workId"`);
        await queryRunner.query(`ALTER TABLE "c0"."anime_details" ADD CONSTRAINT "FK_21ab4364b15e81e739b47f02c73" FOREIGN KEY ("workId") REFERENCES "c0"."works"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "c0"."manga_details" ADD CONSTRAINT "FK_3252e63fe8ce649770e57f35e69" FOREIGN KEY ("workId") REFERENCES "c0"."works"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
