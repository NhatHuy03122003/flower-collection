-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "role" "Role" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "UserMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserMember_memberId_idx" ON "UserMember"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "UserMember_userId_memberId_key" ON "UserMember"("userId", "memberId");

-- AddForeignKey
ALTER TABLE "UserMember" ADD CONSTRAINT "UserMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMember" ADD CONSTRAINT "UserMember_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
