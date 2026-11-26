import "server-only";

import { cache } from "react";

import { requireAdmin } from "./auth-guard";
import { prisma } from "./prisma";
import type { Role } from "./user";

export type AdminUserMemberItem = {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  isActive: boolean;
};

export type AdminUserListItem = {
  id: string;
  username: string;
  displayName: string;
  role: Role;
  createdAt: Date;
  members: AdminUserMemberItem[];
};

/**
 * Lấy danh sách toàn bộ tài khoản kèm danh sách Member được gán (ADMIN-only).
 * Tuyệt đối không select passwordHash.
 */
export const getAdminUsers = cache(async (): Promise<AdminUserListItem[]> => {
  await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      username: true,
      displayName: true,
      role: true,
      createdAt: true,
      members: {
        orderBy: { member: { displayName: "asc" } },
        select: {
          member: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true,
              isActive: true,
            },
          },
        },
      },
    },
  });

  return users.map((user) => ({
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
    createdAt: user.createdAt,
    members: user.members.map((assignment) => assignment.member),
  }));
});
