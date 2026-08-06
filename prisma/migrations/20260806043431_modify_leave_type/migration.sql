/*
  Warnings:

  - The values [SPECIAL] on the enum `LeaveType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LeaveType_new" AS ENUM ('OUTING', 'EMERGENCY', 'FUNCTION', 'PERSONAL_WORK', 'REGULAR');
ALTER TABLE "public"."LeaveRequest" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "LeaveRequest" ALTER COLUMN "type" TYPE "LeaveType_new" USING ("type"::text::"LeaveType_new");
ALTER TYPE "LeaveType" RENAME TO "LeaveType_old";
ALTER TYPE "LeaveType_new" RENAME TO "LeaveType";
DROP TYPE "public"."LeaveType_old";
ALTER TABLE "LeaveRequest" ALTER COLUMN "type" SET DEFAULT 'OUTING';
COMMIT;

-- AlterTable
ALTER TABLE "LeaveRequest" ALTER COLUMN "type" SET DEFAULT 'OUTING';
