import "server-only";

import { cache } from "react";

import { requireAdmin } from "./auth-guard";
import { getMemberOwnershipSummaries } from "./flower-owner";
import { prisma } from "./prisma";

export type AdminAccountStats = {
  totalUsers: number;
  usersWithoutMembers: number;
  unassignedMembers: number;
};

export type AdminMemberProgressItem = {
  id: string;
  displayName: string;
  gameHandle: string | null;
  ownedCount: number;
  totalCount: number;
  completionPercentage: number;
};

export type AdminTopFlowerItem = {
  id: string;
  name: string;
  color: string | null;
  imageUrl: string;
  ownerCount: number;
};

/**
 * Thống kê tài khoản USER và tình trạng gán thành viên (ADMIN-only).
 * - Không tính ADMIN vào số USER.
 * - Thành viên bị ẩn (isActive = false) không được tính là quyền truy cập hợp lệ
 *   hoặc thành viên khả dụng, nhất quán với canAccessMember().
 */
export const getAdminAccountStats = cache(
  async (): Promise<AdminAccountStats> => {
    await requireAdmin();

    const [totalUsers, usersWithoutMembers, unassignedMembers] =
      await Promise.all([
        prisma.user.count({
          where: { role: "USER" },
        }),
        prisma.user.count({
          where: {
            role: "USER",
            members: {
              none: {
                member: { isActive: true },
              },
            },
          },
        }),
        prisma.member.count({
          where: {
            isActive: true,
            userMembers: {
              none: {
                user: { role: "USER" },
              },
            },
          },
        }),
      ]);

    return {
      totalUsers,
      usersWithoutMembers,
      unassignedMembers,
    };
  },
);

/**
 * Thống kê tiến độ tick hoa của từng thành viên đang hoạt động (ADMIN-only).
 * Tái sử dụng getMemberOwnershipSummaries() để tính trên hoa isActive = true
 * và xử lý an toàn khi tổng số hoa = 0.
 */
export const getAdminMemberProgress = cache(
  async (): Promise<AdminMemberProgressItem[]> => {
    await requireAdmin();

    const members = await prisma.member.findMany({
      where: { isActive: true },
      orderBy: { displayName: "asc" },
      select: {
        id: true,
        displayName: true,
        gameHandle: true,
      },
    });

    const summaries = await getMemberOwnershipSummaries(
      members.map((member) => member.id),
    );

    return members
      .map((member) => {
        const summary = summaries.get(member.id) ?? {
          ownedCount: 0,
          totalCount: 0,
          completionPercentage: 0,
        };

        return {
          id: member.id,
          displayName: member.displayName,
          gameHandle: member.gameHandle,
          ownedCount: summary.ownedCount,
          totalCount: summary.totalCount,
          completionPercentage: summary.completionPercentage,
        };
      })
      .sort(
        (a, b) =>
          b.completionPercentage - a.completionPercentage ||
          b.ownedCount - a.ownedCount ||
          a.displayName.localeCompare(b.displayName, "vi"),
      );
  },
);

/**
 * Xếp hạng hoa đang hoạt động được nhiều thành viên đang hoạt động tick nhất (ADMIN-only).
 * Bảng FlowerOwner có unique(flowerId, memberId) nên mỗi thành viên chỉ được tính 1 lần/hoa.
 */
export const getAdminTopTickedFlowers = cache(
  async (limit = 20): Promise<AdminTopFlowerItem[]> => {
    await requireAdmin();

    const safeLimit = Math.min(Math.max(limit, 1), 20);

    const grouped = await prisma.flowerOwner.groupBy({
      by: ["flowerId"],
      where: {
        flower: { isActive: true },
        member: { isActive: true },
      },
      _count: {
        memberId: true,
      },
      orderBy: {
        _count: {
          memberId: "desc",
        },
      },
      take: safeLimit,
    });

    if (grouped.length === 0) {
      return [];
    }

    const flowerIds = grouped.map((item) => item.flowerId);
    const flowers = await prisma.flower.findMany({
      where: { id: { in: flowerIds }, isActive: true },
      select: {
        id: true,
        name: true,
        color: true,
        imageUrl: true,
      },
    });

    const flowerById = new Map(flowers.map((flower) => [flower.id, flower]));

    return grouped
      .map((item) => {
        const flower = flowerById.get(item.flowerId);
        if (!flower) {
          return null;
        }
        return {
          id: flower.id,
          name: flower.name,
          color: flower.color,
          imageUrl: flower.imageUrl,
          ownerCount: item._count.memberId,
        };
      })
      .filter((item): item is AdminTopFlowerItem => item !== null)
      .sort(
        (a, b) =>
          b.ownerCount - a.ownerCount || a.name.localeCompare(b.name, "vi"),
      );
  },
);
