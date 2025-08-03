import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddConversationIndexes1710339600001 implements MigrationInterface {
  name = 'AddConversationIndexes1710339600001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add GIN indexes for JSONB fields to improve query performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_conversation_sender_id" 
      ON "conversation" USING GIN ((sender->>'id'));
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_conversation_receiver_id" 
      ON "conversation" USING GIN ((receiver->>'id'));
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_conversation_updated_at" 
      ON "conversation" ("updatedAt" DESC);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_conversation_created_at" 
      ON "conversation" ("createdAt" DESC);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_conversation_sender_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_conversation_receiver_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_conversation_updated_at"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_conversation_created_at"`,
    );
  }
}
