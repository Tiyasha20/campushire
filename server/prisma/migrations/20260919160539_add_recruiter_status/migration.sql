-- CreateEnum
CREATE TYPE "RecruiterStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "RecruiterProfile" ADD COLUMN     "status" "RecruiterStatus" NOT NULL DEFAULT 'PENDING';
