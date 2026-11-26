-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'USER_PENDING_MEMBER_ASSIGNMENT';

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN "linkUrl" TEXT,
ADD COLUMN "resolvedAt" TIMESTAMP(3),
ADD COLUMN "targetUserId" TEXT;

-- CreateIndex
CREATE INDEX "Notification_type_targetUserId_resolvedAt_idx" ON "Notification"("type", "targetUserId", "resolvedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_userId_type_targetUserId_key" ON "Notification"("userId", "type", "targetUserId");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
