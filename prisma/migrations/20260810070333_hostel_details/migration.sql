-- CreateEnum
CREATE TYPE "Hostel" AS ENUM ('NBH', 'OBH', 'NGH', 'OGN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "HostelName" "Hostel",
ADD COLUMN     "HostelRoomNo" INTEGER;
