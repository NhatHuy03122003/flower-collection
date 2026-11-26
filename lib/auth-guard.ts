import "server-only";

import { cache } from "react";

import { getCurrentUser } from "./current-user";
import { getMemberById } from "./member";
import type { Member } from "./member";
import { prisma } from "./prisma";
import type { User } from "./user";

export type AuthErrorCode = "UNAUTHENTICATED" | "FORBIDDEN";

export class AuthError extends Error {
  readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.name = "AuthError";
    this.code = code;
  }
}

/**
 * Yêu cầu người dùng đã đăng nhập.
 * Không gọi redirect() để dùng an toàn trong Server Actions.
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    throw new AuthError(
      "UNAUTHENTICATED",
      "Bạn cần đăng nhập để thực hiện thao tác này.",
    );
  }

  return user;
}

/**
 * Yêu cầu người dùng hiện tại có vai trò ADMIN.
 */
export async function requireAdmin(): Promise<User> {
  const user = await requireAuth();

  if (user.role !== "ADMIN") {
    throw new AuthError("FORBIDDEN", "Bạn không có quyền quản trị.");
  }

  return user;
}

/**
 * Kiểm tra người dùng hiện tại có quyền truy cập Member hay không.
 * - Guest: false
 * - Member không tồn tại: false
 * - ADMIN: true (kể cả Member inactive)
 * - USER: chỉ true khi Member active và tồn tại bản ghi UserMember
 */
export async function canAccessMember(memberId: string): Promise<boolean> {
  if (typeof memberId !== "string" || !memberId.trim()) {
    return false;
  }

  const user = await getCurrentUser();

  if (!user) {
    return false;
  }

  const member = await getMemberById(memberId);

  if (!member) {
    return false;
  }

  if (user.role === "ADMIN") {
    return true;
  }

  if (!member.isActive) {
    return false;
  }

  const assignment = await prisma.userMember.findUnique({
    where: {
      userId_memberId: {
        userId: user.id,
        memberId: member.id,
      },
    },
    select: { id: true },
  });

  return assignment !== null;
}

/**
 * Yêu cầu quyền truy cập Member. Trả về { user, member } nếu hợp lệ.
 * Không tiết lộ sự tồn tại của Member nếu người dùng không có quyền.
 */
export async function requireMemberAccess(
  memberId: string,
): Promise<{ user: User; member: Member }> {
  const user = await requireAuth();

  if (typeof memberId !== "string" || !memberId.trim()) {
    throw new AuthError(
      "FORBIDDEN",
      "Bạn không có quyền truy cập thành viên này.",
    );
  }

  const member = await getMemberById(memberId);

  if (!member) {
    throw new AuthError(
      "FORBIDDEN",
      "Bạn không có quyền truy cập thành viên này.",
    );
  }

  if (user.role === "ADMIN") {
    return { user, member };
  }

  if (!member.isActive) {
    throw new AuthError(
      "FORBIDDEN",
      "Bạn không có quyền truy cập thành viên này.",
    );
  }

  const assignment = await prisma.userMember.findUnique({
    where: {
      userId_memberId: {
        userId: user.id,
        memberId: member.id,
      },
    },
    select: { id: true },
  });

  if (!assignment) {
    throw new AuthError(
      "FORBIDDEN",
      "Bạn không có quyền truy cập thành viên này.",
    );
  }

  return { user, member };
}

/**
 * Trả về danh sách Member mà người dùng hiện tại được phép truy cập.
 * - ADMIN: toàn bộ Member
 * - USER: chỉ các Member active được gán qua UserMember
 * - Guest: danh sách rỗng
 */
export const getAccessibleMembers = cache(async (): Promise<Member[]> => {
  const user = await getCurrentUser();

  if (!user) {
    return [];
  }

  if (user.role === "ADMIN") {
    return prisma.member.findMany({
      orderBy: { displayName: "asc" },
    });
  }

  return prisma.member.findMany({
    where: {
      isActive: true,
      userMembers: {
        some: { userId: user.id },
      },
    },
    orderBy: { displayName: "asc" },
  });
});
