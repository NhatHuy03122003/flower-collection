"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

import { AuthError, requireAdmin } from "@/lib/auth-guard";
import {
  createNotificationSafely,
  reopenPendingMemberNotifications,
  resolvePendingMemberNotifications,
} from "@/lib/notification";
import { prisma } from "@/lib/prisma";

export type AdminUserActionResult =
  | { status: "success" }
  | { status: "error"; message: string };

/**
 * Khóa dòng User để các thao tác cấp/thu hồi Member của cùng một USER
 * được tuần tự hóa, tránh trạng thái thông báo bị lệch khi ADMIN thao tác đồng thời.
 */
async function lockUserForMembershipChange(
  tx: Prisma.TransactionClient,
  userId: string,
): Promise<void> {
  await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${userId} FOR UPDATE`;
}

async function authorizeAdmin(): Promise<AdminUserActionResult | null> {
  try {
    await requireAdmin();
    return null;
  } catch (error) {
    if (error instanceof AuthError) {
      return { status: "error", message: error.message };
    }
    throw error;
  }
}

function revalidateAdminUserPaths() {
  revalidatePath("/admin/users");
  revalidatePath("/");
  revalidatePath("/my-flowers");
  revalidatePath("/flowers");
}

function normalizeIds(userId: string, memberId: string) {
  const normalizedUserId = typeof userId === "string" ? userId.trim() : "";
  const normalizedMemberId =
    typeof memberId === "string" ? memberId.trim() : "";

  if (!normalizedUserId || !normalizedMemberId) {
    return null;
  }

  return { userId: normalizedUserId, memberId: normalizedMemberId };
}

/**
 * Gán một Member đang hoạt động cho tài khoản có vai trò USER (ADMIN-only).
 */
export async function assignUserMemberAction(
  userId: string,
  memberId: string,
): Promise<AdminUserActionResult> {
  const authError = await authorizeAdmin();
  if (authError) {
    return authError;
  }

  const ids = normalizeIds(userId, memberId);
  if (!ids) {
    return {
      status: "error",
      message: "Thiếu thông tin tài khoản hoặc thành viên.",
    };
  }

  const [targetUser, targetMember] = await Promise.all([
    prisma.user.findUnique({
      where: { id: ids.userId },
      select: { id: true, role: true },
    }),
    prisma.member.findUnique({
      where: { id: ids.memberId },
      select: { id: true, displayName: true, isActive: true },
    }),
  ]);

  if (!targetUser) {
    return { status: "error", message: "Không tìm thấy tài khoản." };
  }

  if (targetUser.role !== "USER") {
    return {
      status: "error",
      message: "Không thể gán thành viên cho tài khoản ADMIN.",
    };
  }

  if (!targetMember) {
    return { status: "error", message: "Không tìm thấy thành viên." };
  }

  if (!targetMember.isActive) {
    return {
      status: "error",
      message: "Chỉ được gán thành viên đang hoạt động.",
    };
  }

  const existing = await prisma.userMember.findUnique({
    where: {
      userId_memberId: {
        userId: targetUser.id,
        memberId: targetMember.id,
      },
    },
    select: { id: true },
  });

  if (existing) {
    return {
      status: "error",
      message: "Thành viên này đã được gán cho tài khoản.",
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await lockUserForMembershipChange(tx, targetUser.id);

      await tx.userMember.create({
        data: {
          userId: targetUser.id,
          memberId: targetMember.id,
        },
      });

      await resolvePendingMemberNotifications(tx, targetUser.id);
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        status: "error",
        message: "Thành viên này đã được gán cho tài khoản.",
      };
    }
    throw error;
  }

  revalidateAdminUserPaths();

  await createNotificationSafely({
    userId: targetUser.id,
    type: "MEMBER_ASSIGNED",
    title: "Đã được cấp quyền thành viên",
    message: `Bạn đã được cấp quyền quản lý thành viên "${targetMember.displayName}".`,
  });

  return { status: "success" };
}

/**
 * Thu hồi quyền truy cập một Member khỏi tài khoản User (ADMIN-only).
 * Không xóa User, Member hay dữ liệu FlowerOwner.
 */
export async function revokeUserMemberAction(
  userId: string,
  memberId: string,
): Promise<AdminUserActionResult> {
  const authError = await authorizeAdmin();
  if (authError) {
    return authError;
  }

  const ids = normalizeIds(userId, memberId);
  if (!ids) {
    return {
      status: "error",
      message: "Thiếu thông tin tài khoản hoặc thành viên.",
    };
  }

  const [targetUser, targetMember] = await Promise.all([
    prisma.user.findUnique({
      where: { id: ids.userId },
      select: {
        id: true,
        role: true,
        username: true,
        displayName: true,
        createdAt: true,
      },
    }),
    prisma.member.findUnique({
      where: { id: ids.memberId },
      select: { id: true, displayName: true },
    }),
  ]);

  if (!targetUser) {
    return { status: "error", message: "Không tìm thấy tài khoản." };
  }

  if (targetUser.role !== "USER") {
    return {
      status: "error",
      message: "Không thể thu hồi thành viên khỏi tài khoản ADMIN.",
    };
  }

  if (!targetMember) {
    return { status: "error", message: "Không tìm thấy thành viên." };
  }

  const deletedCount = await prisma.$transaction(async (tx) => {
    await lockUserForMembershipChange(tx, targetUser.id);

    const deleted = await tx.userMember.deleteMany({
      where: {
        userId: targetUser.id,
        memberId: targetMember.id,
      },
    });

    if (deleted.count > 0) {
      await reopenPendingMemberNotifications(tx, targetUser);
    }

    return deleted.count;
  });

  if (deletedCount === 0) {
    return {
      status: "error",
      message: "Tài khoản chưa được gán thành viên này.",
    };
  }

  revalidateAdminUserPaths();

  await createNotificationSafely({
    userId: targetUser.id,
    type: "MEMBER_REVOKED",
    title: "Đã bị thu hồi quyền thành viên",
    message: `Quyền quản lý thành viên "${targetMember.displayName}" đã bị thu hồi khỏi tài khoản của bạn.`,
  });

  return { status: "success" };
}

/**
 * Xóa tài khoản USER (ADMIN-only). UserMember và Notification liên quan
 * được xóa qua onDelete: Cascade; Member, FlowerOwner và Flower không bị ảnh hưởng.
 */
export async function deleteUserAccountAction(
  userId: string,
): Promise<AdminUserActionResult> {
  let adminId: string;
  try {
    adminId = (await requireAdmin()).id;
  } catch (error) {
    if (error instanceof AuthError) {
      return { status: "error", message: error.message };
    }
    throw error;
  }

  const normalizedUserId = typeof userId === "string" ? userId.trim() : "";
  if (!normalizedUserId) {
    return { status: "error", message: "Thiếu thông tin tài khoản." };
  }

  if (normalizedUserId === adminId) {
    return {
      status: "error",
      message: "Không thể xóa tài khoản đang đăng nhập.",
    };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      await lockUserForMembershipChange(tx, normalizedUserId);

      const targetUser = await tx.user.findUnique({
        where: { id: normalizedUserId },
        select: { id: true, role: true },
      });

      if (!targetUser) {
        return "NOT_FOUND" as const;
      }

      if (targetUser.role !== "USER") {
        return "NOT_USER" as const;
      }

      await tx.user.delete({ where: { id: targetUser.id } });
      return "DELETED" as const;
    });

    if (result === "NOT_FOUND") {
      return { status: "error", message: "Không tìm thấy tài khoản." };
    }

    if (result === "NOT_USER") {
      return {
        status: "error",
        message: "Không thể xóa tài khoản ADMIN.",
      };
    }
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return { status: "error", message: "Không tìm thấy tài khoản." };
    }
    throw error;
  }

  revalidateAdminUserPaths();

  return { status: "success" };
}
