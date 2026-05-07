import { MigrationInterface, QueryRunner } from "typeorm";

export class RefineUserProfileSocialAndSecurity1777241226084 implements MigrationInterface {
    name = 'RefineUserProfileSocialAndSecurity1777241226084'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "c0"."favorites" ("id" uuid NOT NULL, "userId" uuid NOT NULL, "workId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_890818d27523748dd36a4d1bdc8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e747534006c6e3c2f09939da60" ON "c0"."favorites" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_4a1ae8645815fe9060ade1d120" ON "c0"."favorites" ("workId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_419c7c9be5d5ebff54a2806d73" ON "c0"."favorites" ("userId", "workId") `);
        await queryRunner.query(`CREATE TABLE "c0"."user_follows" ("id" uuid NOT NULL, "followerId" uuid NOT NULL, "followingId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_da8e8793113adf3015952880966" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_6300484b604263eaae8a6aab88" ON "c0"."user_follows" ("followerId") `);
        await queryRunner.query(`CREATE INDEX "IDX_7c6c27f12c4e972eab4b3aaccb" ON "c0"."user_follows" ("followingId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_48050dfc1d2514f4c2059f155e" ON "c0"."user_follows" ("followerId", "followingId") `);
        await queryRunner.query(`ALTER TABLE "c0"."users" DROP COLUMN "chaptersCreated"`);
        await queryRunner.query(`ALTER TABLE "c0"."users" DROP CONSTRAINT "UQ_226bb9aa7aa8a69991209d58f59"`);
        await queryRunner.query(`ALTER TABLE "c0"."users" RENAME COLUMN "userName" TO "username"`);
        await queryRunner.query(`ALTER TABLE "c0"."users" DROP COLUMN "verificationToken"`);
        await queryRunner.query(`ALTER TABLE "c0"."users" DROP COLUMN "resetPasswordToken"`);
        await queryRunner.query(`ALTER TABLE "c0"."users" ADD CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username")`);
        await queryRunner.query(`ALTER TABLE "c0"."users" ADD "verificationTokenHash" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "c0"."users" ADD "resetPasswordTokenHash" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "c0"."users" ADD "collectionsCount" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "c0"."users" ADD "followingCount" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "c0"."users" ADD "followersCount" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "c0"."users" ADD "isProfilePublic" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "c0"."users" ADD "showActivity" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "c0"."users" ADD "showCollections" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "c0"."users" ADD "timeZone" character varying(50)`);
        await queryRunner.query(`CREATE TYPE "c0"."users_theme_enum" AS ENUM('LIGHT', 'DARK', 'SYSTEM')`);
        await queryRunner.query(`ALTER TABLE "c0"."users" ALTER COLUMN "theme" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "c0"."users" ALTER COLUMN "theme" TYPE "c0"."users_theme_enum" USING CASE WHEN upper("theme") IN ('LIGHT', 'DARK', 'SYSTEM') THEN upper("theme")::"c0"."users_theme_enum" ELSE 'DARK'::"c0"."users_theme_enum" END`);
        await queryRunner.query(`ALTER TABLE "c0"."users" ALTER COLUMN "theme" SET DEFAULT 'DARK'`);
        await queryRunner.query(`CREATE INDEX "IDX_204e9b624861ff4a5b26819210" ON "c0"."users" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_c0f30dcc205fa03b0d77e95118" ON "c0"."users" ("lastLoginAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_3676155292d72c67cd4e090514" ON "c0"."users" ("status") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_fe0bb3f6520ee0469504521e71" ON "c0"."users" ("username") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "c0"."users" ("email") `);
        await queryRunner.query(`ALTER TABLE "c0"."favorites" ADD CONSTRAINT "FK_e747534006c6e3c2f09939da60f" FOREIGN KEY ("userId") REFERENCES "c0"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "c0"."favorites" ADD CONSTRAINT "FK_4a1ae8645815fe9060ade1d1207" FOREIGN KEY ("workId") REFERENCES "c0"."works"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "c0"."user_follows" ADD CONSTRAINT "FK_6300484b604263eaae8a6aab88d" FOREIGN KEY ("followerId") REFERENCES "c0"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "c0"."user_follows" ADD CONSTRAINT "FK_7c6c27f12c4e972eab4b3aaccbf" FOREIGN KEY ("followingId") REFERENCES "c0"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "c0"."user_follows" DROP CONSTRAINT "FK_7c6c27f12c4e972eab4b3aaccbf"`);
        await queryRunner.query(`ALTER TABLE "c0"."user_follows" DROP CONSTRAINT "FK_6300484b604263eaae8a6aab88d"`);
        await queryRunner.query(`ALTER TABLE "c0"."favorites" DROP CONSTRAINT "FK_4a1ae8645815fe9060ade1d1207"`);
        await queryRunner.query(`ALTER TABLE "c0"."favorites" DROP CONSTRAINT "FK_e747534006c6e3c2f09939da60f"`);
        await queryRunner.query(`DROP INDEX "c0"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP INDEX "c0"."IDX_fe0bb3f6520ee0469504521e71"`);
        await queryRunner.query(`DROP INDEX "c0"."IDX_3676155292d72c67cd4e090514"`);
        await queryRunner.query(`DROP INDEX "c0"."IDX_c0f30dcc205fa03b0d77e95118"`);
        await queryRunner.query(`DROP INDEX "c0"."IDX_204e9b624861ff4a5b26819210"`);
        await queryRunner.query(`ALTER TABLE "c0"."users" ALTER COLUMN "theme" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "c0"."users" ALTER COLUMN "theme" TYPE character varying USING lower("theme"::text)`);
        await queryRunner.query(`ALTER TABLE "c0"."users" ALTER COLUMN "theme" SET DEFAULT 'dark'`);
        await queryRunner.query(`DROP TYPE "c0"."users_theme_enum"`);
        await queryRunner.query(`ALTER TABLE "c0"."users" DROP COLUMN "timeZone"`);
        await queryRunner.query(`ALTER TABLE "c0"."users" DROP COLUMN "showCollections"`);
        await queryRunner.query(`ALTER TABLE "c0"."users" DROP COLUMN "showActivity"`);
        await queryRunner.query(`ALTER TABLE "c0"."users" DROP COLUMN "isProfilePublic"`);
        await queryRunner.query(`ALTER TABLE "c0"."users" DROP COLUMN "followersCount"`);
        await queryRunner.query(`ALTER TABLE "c0"."users" DROP COLUMN "followingCount"`);
        await queryRunner.query(`ALTER TABLE "c0"."users" DROP COLUMN "collectionsCount"`);
        await queryRunner.query(`ALTER TABLE "c0"."users" DROP COLUMN "resetPasswordTokenHash"`);
        await queryRunner.query(`ALTER TABLE "c0"."users" DROP COLUMN "verificationTokenHash"`);
        await queryRunner.query(`ALTER TABLE "c0"."users" DROP CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710"`);
        await queryRunner.query(`ALTER TABLE "c0"."users" RENAME COLUMN "username" TO "userName"`);
        await queryRunner.query(`ALTER TABLE "c0"."users" ADD "resetPasswordToken" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "c0"."users" ADD "verificationToken" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "c0"."users" ADD CONSTRAINT "UQ_226bb9aa7aa8a69991209d58f59" UNIQUE ("userName")`);
        await queryRunner.query(`ALTER TABLE "c0"."users" ADD "chaptersCreated" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`DROP INDEX "c0"."IDX_48050dfc1d2514f4c2059f155e"`);
        await queryRunner.query(`DROP INDEX "c0"."IDX_7c6c27f12c4e972eab4b3aaccb"`);
        await queryRunner.query(`DROP INDEX "c0"."IDX_6300484b604263eaae8a6aab88"`);
        await queryRunner.query(`DROP TABLE "c0"."user_follows"`);
        await queryRunner.query(`DROP INDEX "c0"."IDX_419c7c9be5d5ebff54a2806d73"`);
        await queryRunner.query(`DROP INDEX "c0"."IDX_4a1ae8645815fe9060ade1d120"`);
        await queryRunner.query(`DROP INDEX "c0"."IDX_e747534006c6e3c2f09939da60"`);
        await queryRunner.query(`DROP TABLE "c0"."favorites"`);
    }

}
