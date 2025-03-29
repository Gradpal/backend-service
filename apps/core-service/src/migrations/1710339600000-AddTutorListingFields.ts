import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTutorListingFields1710339600000 implements MigrationInterface {
  name = 'AddTutorListingFields1710339600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new columns to tutor table
    await queryRunner.query(`
      ALTER TABLE "tutor"
      ADD COLUMN IF NOT EXISTS "totalStudents" integer DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "totalLessons" integer DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "attendanceRate" decimal DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "responseRate" decimal DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "repeatStudents" integer DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "rating" decimal DEFAULT 5.0,
      ADD COLUMN IF NOT EXISTS "last_seen" timestamp,
      ADD COLUMN IF NOT EXISTS "profile_id" uuid,
      ADD COLUMN IF NOT EXISTS "timezone" varchar,
      ADD COLUMN IF NOT EXISTS "university" varchar,
      ADD COLUMN IF NOT EXISTS "hourlyRate" decimal,
      ADD COLUMN IF NOT EXISTS "isVerified" boolean DEFAULT false,
      ADD CONSTRAINT "REL_tutor_profile" UNIQUE ("profile_id"),
      ADD CONSTRAINT "FK_tutor_profile" FOREIGN KEY ("profile_id") REFERENCES "user"("id") ON DELETE CASCADE
    `);

    // Rename existing columns if they exist
    await queryRunner.query(`
      ALTER TABLE "tutor"
      DROP COLUMN IF EXISTS "time_zone",
      DROP COLUMN IF EXISTS "institution",
      DROP COLUMN IF EXISTS "price_per_hour",
      DROP COLUMN IF EXISTS "verified",
      DROP COLUMN IF EXISTS "total_students",
      DROP COLUMN IF EXISTS "total_lessons",
      DROP COLUMN IF EXISTS "attendance_rate",
      DROP COLUMN IF EXISTS "response_rate",
      DROP COLUMN IF EXISTS "repeat_students"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the columns and constraints
    await queryRunner.query(`
      ALTER TABLE "tutor"
      DROP CONSTRAINT IF EXISTS "FK_tutor_profile",
      DROP CONSTRAINT IF EXISTS "REL_tutor_profile",
      DROP COLUMN IF EXISTS "totalStudents",
      DROP COLUMN IF EXISTS "totalLessons",
      DROP COLUMN IF EXISTS "attendanceRate",
      DROP COLUMN IF EXISTS "responseRate",
      DROP COLUMN IF EXISTS "repeatStudents",
      DROP COLUMN IF EXISTS "rating",
      DROP COLUMN IF EXISTS "last_seen",
      DROP COLUMN IF EXISTS "profile_id",
      DROP COLUMN IF EXISTS "timezone",
      DROP COLUMN IF EXISTS "university",
      DROP COLUMN IF EXISTS "hourlyRate",
      DROP COLUMN IF EXISTS "isVerified"
    `);
  }
}
