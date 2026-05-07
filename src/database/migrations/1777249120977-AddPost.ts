import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPost1777249120977 implements MigrationInterface {
    name = 'AddPost1777249120977'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "c0"."posts_visibility_status_enum" AS ENUM('PUBLIC', 'PRIVATE', 'UNLISTED', 'HIDDEN')`);
        await queryRunner.query(`CREATE TYPE "c0"."posts_moderation_status_enum" AS ENUM('IN_REVIEW', 'OK', 'REPORTED', 'FLAGGED', 'RESTRICTED', 'DELETED')`);
        await queryRunner.query(`CREATE TYPE "c0"."posts_status_enum" AS ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED')`);
        await queryRunner.query(`CREATE TABLE "c0"."posts" ("id" uuid NOT NULL, "title" character varying(255) NOT NULL, "content" text NOT NULL, "excerpt" character varying(180), "tag" character varying(80), "banner_url" character varying(255) NOT NULL, "contain_spoilers" boolean NOT NULL DEFAULT false, "comment_count" integer NOT NULL DEFAULT '0', "share_count" integer NOT NULL DEFAULT '0', "like_count" integer NOT NULL DEFAULT '0', "is_pinned" boolean NOT NULL DEFAULT false, "is_featured" boolean NOT NULL DEFAULT false, "visibility_status" "c0"."posts_visibility_status_enum" NOT NULL DEFAULT 'PUBLIC', "moderation_status" "c0"."posts_moderation_status_enum" NOT NULL DEFAULT 'IN_REVIEW', "status" "c0"."posts_status_enum" NOT NULL DEFAULT 'DRAFT', "published_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "author_id" uuid NOT NULL, "work_id" uuid, CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_312c63be865c81b922e39c2475" ON "c0"."posts" ("author_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_3d5a1f635f5d457f52435b5c4e" ON "c0"."posts" ("work_id") `);
        await queryRunner.query(`DROP INDEX "c0"."IDX_108358e19103e130c8f64405b1"`);
        await queryRunner.query(`ALTER TYPE "c0"."works_visibilitystatus_enum" RENAME TO "works_visibilitystatus_enum_old"`);
        await queryRunner.query(`CREATE TYPE "c0"."works_visibilitystatus_enum" AS ENUM('PUBLIC', 'PRIVATE', 'UNLISTED', 'HIDDEN')`);
        await queryRunner.query(`ALTER TABLE "c0"."works" ALTER COLUMN "visibilityStatus" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "c0"."works" ALTER COLUMN "visibilityStatus" TYPE "c0"."works_visibilitystatus_enum" USING "visibilityStatus"::"text"::"c0"."works_visibilitystatus_enum"`);
        await queryRunner.query(`ALTER TABLE "c0"."works" ALTER COLUMN "visibilityStatus" SET DEFAULT 'PUBLIC'`);
        await queryRunner.query(`DROP TYPE "c0"."works_visibilitystatus_enum_old"`);
        await queryRunner.query(`ALTER TYPE "c0"."works_moderationstatus_enum" RENAME TO "works_moderationstatus_enum_old"`);
        await queryRunner.query(`CREATE TYPE "c0"."works_moderationstatus_enum" AS ENUM('IN_REVIEW', 'OK', 'REPORTED', 'FLAGGED', 'RESTRICTED', 'DELETED')`);
        await queryRunner.query(`ALTER TABLE "c0"."works" ALTER COLUMN "moderationStatus" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "c0"."works" ALTER COLUMN "moderationStatus" TYPE "c0"."works_moderationstatus_enum" USING "moderationStatus"::"text"::"c0"."works_moderationstatus_enum"`);
        await queryRunner.query(`ALTER TABLE "c0"."works" ALTER COLUMN "moderationStatus" SET DEFAULT 'OK'`);
        await queryRunner.query(`DROP TYPE "c0"."works_moderationstatus_enum_old"`);
        await queryRunner.query(`CREATE INDEX "IDX_108358e19103e130c8f64405b1" ON "c0"."works" ("visibilityStatus", "moderationStatus") `);
        await queryRunner.query(`ALTER TABLE "c0"."posts" ADD CONSTRAINT "FK_312c63be865c81b922e39c2475e" FOREIGN KEY ("author_id") REFERENCES "c0"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "c0"."posts" ADD CONSTRAINT "FK_3d5a1f635f5d457f52435b5c4e2" FOREIGN KEY ("work_id") REFERENCES "c0"."works"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "c0"."posts" DROP CONSTRAINT "FK_3d5a1f635f5d457f52435b5c4e2"`);
        await queryRunner.query(`ALTER TABLE "c0"."posts" DROP CONSTRAINT "FK_312c63be865c81b922e39c2475e"`);
        await queryRunner.query(`DROP INDEX "c0"."IDX_108358e19103e130c8f64405b1"`);
        await queryRunner.query(`CREATE TYPE "c0"."works_moderationstatus_enum_old" AS ENUM('OK', 'REPORTED', 'FLAGGED', 'RESTRICTED', 'DELETED')`);
        await queryRunner.query(`ALTER TABLE "c0"."works" ALTER COLUMN "moderationStatus" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "c0"."works" ALTER COLUMN "moderationStatus" TYPE "c0"."works_moderationstatus_enum_old" USING "moderationStatus"::"text"::"c0"."works_moderationstatus_enum_old"`);
        await queryRunner.query(`ALTER TABLE "c0"."works" ALTER COLUMN "moderationStatus" SET DEFAULT 'OK'`);
        await queryRunner.query(`DROP TYPE "c0"."works_moderationstatus_enum"`);
        await queryRunner.query(`ALTER TYPE "c0"."works_moderationstatus_enum_old" RENAME TO "works_moderationstatus_enum"`);
        await queryRunner.query(`CREATE TYPE "c0"."works_visibilitystatus_enum_old" AS ENUM('PUBLISHED', 'UNLISTED', 'PRIVATE', 'ARCHIVED')`);
        await queryRunner.query(`ALTER TABLE "c0"."works" ALTER COLUMN "visibilityStatus" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "c0"."works" ALTER COLUMN "visibilityStatus" TYPE "c0"."works_visibilitystatus_enum_old" USING "visibilityStatus"::"text"::"c0"."works_visibilitystatus_enum_old"`);
        await queryRunner.query(`ALTER TABLE "c0"."works" ALTER COLUMN "visibilityStatus" SET DEFAULT 'PUBLISHED'`);
        await queryRunner.query(`DROP TYPE "c0"."works_visibilitystatus_enum"`);
        await queryRunner.query(`ALTER TYPE "c0"."works_visibilitystatus_enum_old" RENAME TO "works_visibilitystatus_enum"`);
        await queryRunner.query(`CREATE INDEX "IDX_108358e19103e130c8f64405b1" ON "c0"."works" ("moderationStatus", "visibilityStatus") `);
        await queryRunner.query(`DROP INDEX "c0"."IDX_3d5a1f635f5d457f52435b5c4e"`);
        await queryRunner.query(`DROP INDEX "c0"."IDX_312c63be865c81b922e39c2475"`);
        await queryRunner.query(`DROP TABLE "c0"."posts"`);
        await queryRunner.query(`DROP TYPE "c0"."posts_status_enum"`);
        await queryRunner.query(`DROP TYPE "c0"."posts_moderation_status_enum"`);
        await queryRunner.query(`DROP TYPE "c0"."posts_visibility_status_enum"`);
    }

}
