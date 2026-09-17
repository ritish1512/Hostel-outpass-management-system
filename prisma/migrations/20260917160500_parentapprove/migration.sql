/*
  Warnings:

  - A unique constraint covering the columns `[parentSecretToken]` on the table `LeaveRequest` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'ADMIN';

-- AlterTable
ALTER TABLE "LeaveRequest" ADD COLUMN     "parentSecretToken" TEXT,
ADD COLUMN     "visualMatchCode" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "LeaveRequest_parentSecretToken_key" ON "LeaveRequest"("parentSecretToken");
