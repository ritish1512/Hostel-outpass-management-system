/*
  Warnings:

  - The values [OGN] on the enum `Hostel` will be removed. If these variants are still used in the database, this will fail.
  - The values [EXPIRED] on the enum `WorkflowTier` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Hostel_new" AS ENUM ('NBH', 'OBH', 'NGH', 'OGH');
ALTER TABLE "User" ALTER COLUMN "HostelName" TYPE "Hostel_new" USING ("HostelName"::text::"Hostel_new");
ALTER TYPE "Hostel" RENAME TO "Hostel_old";
ALTER TYPE "Hostel_new" RENAME TO "Hostel";
DROP TYPE "public"."Hostel_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "WorkflowTier_new" AS ENUM ('PARENT_REVIEW', 'MENTOR_REVIEW', 'HOD_REVIEW', 'WARDEN_REVIEW', 'PRINCIPAL_REVIEW', 'GATEKEEPER_REVIEW', 'WENT_OUT', 'COMPLETED', 'ARCHIEVED_REJECTED');
ALTER TABLE "public"."LeaveRequest" ALTER COLUMN "tier" DROP DEFAULT;
ALTER TABLE "LeaveRequest" ALTER COLUMN "tier" TYPE "WorkflowTier_new" USING ("tier"::text::"WorkflowTier_new");
ALTER TYPE "WorkflowTier" RENAME TO "WorkflowTier_old";
ALTER TYPE "WorkflowTier_new" RENAME TO "WorkflowTier";
DROP TYPE "public"."WorkflowTier_old";
ALTER TABLE "LeaveRequest" ALTER COLUMN "tier" SET DEFAULT 'PARENT_REVIEW';
COMMIT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "registerNumber" INTEGER;
