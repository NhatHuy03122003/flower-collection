import "server-only";

import type { NotificationType, Prisma } from "@prisma/client";

import { requireAuth } from "./auth-guard";
import { getCurrentUser } from "./current-user";
import { prisma } from "./prisma";

export type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  linkUrl: string | null;
  isRead: boolean;
  resolvedAt: string | null;
  createdAt: string;
};

export type NotificationFeed = {
  notifications: NotificationItem[];
  unreadCount: number;
};

type PendingTargetUser = {
  id: string;
  username: string;
  displayName: string;
  createdAt: Date;
};

type DbClient = Prisma.TransactionClient;

const PENDING_MEMBER_TITLE = "Tài khoản mới chờ cấp quyền";
const PENDING_MEMBER_LINK_URL = "/admin/users";

function buildPendingMemberMessage(targetUser: PendingTargetUser): string {
  const registeredAt = targetUser.createdAt.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `Có tài khoản mới đang chờ được cấp quyền thành viên: ${targetUser.displayName} (@${targetUser.username}) — đăng ký lúc ${registeredAt}.`;
}

/**
 * Tạo thông báo nội bộ một cách an toàn.
 * Không ném lỗi ra ngoài để tránh làm hỏng thao tác nghiệp vụ chính đã thành công.
 */
export async function createNotificationSafely(input: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
}): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
      },
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}

async function findAdminIds(db: DbClient): Promise<string[]> {
  const admins = await db.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true },
  });

  return admins.map((admin) => admin.id);
}

/**
 * Tạo thông báo chờ cấp quyền cho các ADMIN.
 * Tận dụng unique(userId, type, targetUserId) + skipDuplicates để không tạo trùng.
 */
async function createPendingMemberNotifications(
  db: DbClient,
  targetUser: PendingTargetUser,
  adminIds: string[],
): Promise<void> {
  if (adminIds.length === 0) {
    return;
  }

  await db.notification.createMany({
    data: adminIds.map((adminId) => ({
      userId: adminId,
      targetUserId: targetUser.id,
      type: "USER_PENDING_MEMBER_ASSIGNMENT" as const,
      title: PENDING_MEMBER_TITLE,
      message: buildPendingMemberMessage(targetUser),
      linkUrl: PENDING_MEMBER_LINK_URL,
    })),
    skipDuplicates: true,
  });
}

/**
 * Gửi thông báo chờ cấp quyền Member tới tất cả tài khoản ADMIN khi có USER mới đăng ký.
 * Lỗi chỉ được ghi log, không làm thất bại quá trình đăng ký.
 */
export async function notifyAdminsPendingMemberSafely(
  targetUser: PendingTargetUser,
): Promise<void> {
  try {
    const adminIds = await findAdminIds(prisma);
    await createPendingMemberNotifications(prisma, targetUser, adminIds);
  } catch (error) {
    console.error("Failed to notify admins about pending user:", error);
  }
}

/**
 * Đánh dấu đã xử lý (resolvedAt) cho thông báo chờ cấp quyền của USER.
 * Phải chạy trong cùng transaction với thao tác cấp Member. Không thay đổi isRead.
 */
export async function resolvePendingMemberNotifications(
  tx: DbClient,
  targetUserId: string,
): Promise<void> {
  await tx.notification.updateMany({
    where: {
      type: "USER_PENDING_MEMBER_ASSIGNMENT",
      targetUserId,
      resolvedAt: null,
    },
    data: {
      resolvedAt: new Date(),
    },
  });
}

/**
 * Khi thu hồi Member và USER không còn Member đang hoạt động nào,
 * mở lại thông báo chờ cấp quyền cho các ADMIN hiện tại.
 * Phải chạy trong cùng transaction với thao tác thu hồi. Giữ nguyên isRead;
 * tái sử dụng bản ghi cũ nhờ unique(userId, type, targetUserId).
 */
export async function reopenPendingMemberNotifications(
  tx: DbClient,
  targetUser: PendingTargetUser,
): Promise<void> {
  const activeMemberCount = await tx.userMember.count({
    where: {
      userId: targetUser.id,
      member: { isActive: true },
    },
  });

  if (activeMemberCount > 0) {
    return;
  }

  const adminIds = await findAdminIds(tx);

  if (adminIds.length > 0) {
    await tx.notification.updateMany({
      where: {
        type: "USER_PENDING_MEMBER_ASSIGNMENT",
        targetUserId: targetUser.id,
        userId: { in: adminIds },
        resolvedAt: { not: null },
      },
      data: {
        resolvedAt: null,
      },
    });
  }

  await createPendingMemberNotifications(tx, targetUser, adminIds);
}


/**
 * Lấy danh sách thông báo mới nhất và số lượng chưa đọc của người dùng hiện tại.
 * Luôn lọc theo userId từ session phía server.
 */
export async function getMyNotifications(
  limit = 20,
): Promise<NotificationFeed> {
  const user = await getCurrentUser();

  if (!user) {
    return { notifications: [], unreadCount: 0 };
  }

  const safeLimit = Math.min(Math.max(limit, 1), 50);

  const [rows, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: safeLimit,
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        linkUrl: true,
        isRead: true,
        resolvedAt: true,
        createdAt: true,
      },
    }),
    prisma.notification.count({
      where: { userId: user.id, isRead: false },
    }),
  ]);

  return {
    notifications: rows.map((row) => ({
      id: row.id,
      type: row.type,
      title: row.title,
      message: row.message,
      linkUrl: row.linkUrl,
      isRead: row.isRead,
      resolvedAt: row.resolvedAt ? row.resolvedAt.toISOString() : null,
      createdAt: row.createdAt.toISOString(),
    })),
    unreadCount,
  };
}

/**
 * Đánh dấu một thông báo của người dùng hiện tại là đã đọc.
 * Luôn ràng buộc userId = user.id để ngăn USER đọc/sửa thông báo của người khác.
 */
export async function markNotificationAsRead(
  notificationId: string,
): Promise<boolean> {
  const user = await requireAuth();
  const normalizedId =
    typeof notificationId === "string" ? notificationId.trim() : "";

  if (!normalizedId) {
    return false;
  }

  const result = await prisma.notification.updateMany({
    where: {
      id: normalizedId,
      userId: user.id,
    },
    data: { isRead: true },
  });

  return result.count > 0;
}

/**
 * Đánh dấu toàn bộ thông báo chưa đọc của người dùng hiện tại là đã đọc.
 */
export async function markAllNotificationsAsRead(): Promise<number> {
  const user = await requireAuth();

  const result = await prisma.notification.updateMany({
    where: {
      userId: user.id,
      isRead: false,
    },
    data: { isRead: true },
  });

  return result.count;
}
