import { cache } from "react";

import type { Prisma } from "@prisma/client";

import type { getFlowers } from "./flower";
import { prisma } from "./prisma";

type Flower = Awaited<ReturnType<typeof getFlowers>>[number];

export type FlowerOwnerListItem = {
  id: string;
  displayName: string;
};

export type FlowerOwnerSummary = {
  ownerCount: number;
  owners: FlowerOwnerListItem[];
};

export type MemberOwnershipSummary = {
  ownedCount: number;
  totalCount: number;
  completionPercentage: number;
};

export type FlowerCollectionItem = FlowerOwnerSummary & {
  flower: Flower;
  isOwnedByCurrentMember: boolean;
};

const COLOR_ORDER: string[] = [
  "Đỏ",
  "Cam",
  "Vàng",
  "Xanh lá",
  "Xanh dương",
  "Tím",
  "Hồng",
  "Trắng",
];

// Chỉ tính các thành viên còn hoạt động; thành viên đã ẩn không xuất hiện
// trong danh sách sở hữu và không được tính vào ownerCount.
async function queryCollection(
  memberId: string | null,
  where: Prisma.FlowerWhereInput | undefined,
): Promise<FlowerCollectionItem[]> {
  const flowers = await prisma.flower.findMany({
    // Chỉ hiển thị hoa đang hoạt động; hoa đã soft delete không xuất hiện.
    where: { ...where, isActive: true },
    orderBy: { createdAt: "desc" },
    include: {
      owners: {
        where: { member: { isActive: true } },
        orderBy: { ownedAt: "asc" },
        select: {
          memberId: true,
          member: { select: { displayName: true } },
        },
      },
    },
  });

  return flowers.map(({ owners, ...flower }) => ({
    flower,
    ownerCount: owners.length,
    owners: owners.map((owner) => ({
      id: owner.memberId,
      displayName: owner.member.displayName,
    })),
    isOwnedByCurrentMember:
      memberId !== null && owners.some((owner) => owner.memberId === memberId),
  }));
}

/**
 * Tất cả hoa đang hoạt động kèm thông tin người sở hữu.
 * memberId chỉ dùng để đánh dấu hoa đang được thành viên hiện tại tick.
 */
export const getFlowerCollection = cache((memberId: string | null) =>
  queryCollection(memberId, undefined),
);

/**
 * Chỉ các hoa mà thành viên hiện tại đang sở hữu.
 */
export const getOwnedFlowerCollection = cache((memberId: string) =>
  queryCollection(memberId, {
    owners: { some: { memberId } },
  }),
);

/**
 * Bật/tắt sở hữu hoa cho một thành viên.
 * Trả về trạng thái sở hữu sau khi đổi.
 */
export async function toggleFlowerOwner(memberId: string, flowerId: string) {
  const existing = await prisma.flowerOwner.findUnique({
    where: { flowerId_memberId: { flowerId, memberId } },
    select: { id: true },
  });

  if (existing) {
    await prisma.flowerOwner.delete({ where: { id: existing.id } });
    return false;
  }

  await prisma.flowerOwner.create({ data: { flowerId, memberId } });
  return true;
}

/**
 * Gán chủ sở hữu duy nhất cho một hoa, hoặc bỏ chủ khi memberId = null.
 * Vẫn dùng bảng FlowerOwner; thao tác thay thế toàn bộ chủ hiện có để mỗi hoa
 * chỉ còn tối đa một chủ, khớp với dropdown chọn chủ ở trang quản lý hoa.
 */
export async function setFlowerOwner(
  flowerId: string,
  memberId: string | null,
) {
  await prisma.$transaction(async (tx) => {
    await tx.flowerOwner.deleteMany({ where: { flowerId } });

    if (memberId) {
      await tx.flowerOwner.create({ data: { flowerId, memberId } });
    }
  });
}

/**
 * Chủ sở hữu của tất cả hoa đang hoạt động, gom theo flowerId.
 * Dùng cho dropdown chọn chủ ở trang quản lý hoa.
 * Bọc cache() để không query trùng trong cùng request.
 */
export const getActiveFlowerOwners = cache(
  async (): Promise<Map<string, FlowerOwnerListItem[]>> => {
    const owners = await prisma.flowerOwner.findMany({
      where: { flower: { isActive: true }, member: { isActive: true } },
      orderBy: { ownedAt: "asc" },
      select: {
        flowerId: true,
        memberId: true,
        member: { select: { displayName: true } },
      },
    });

    const ownersByFlower = new Map<string, FlowerOwnerListItem[]>();

    for (const owner of owners) {
      const list = ownersByFlower.get(owner.flowerId) ?? [];
      list.push({ id: owner.memberId, displayName: owner.member.displayName });
      ownersByFlower.set(owner.flowerId, list);
    }

    return ownersByFlower;
  },
);

/**
 * Gom hoa theo màu để hiển thị thành từng khu vực.
 */
export function groupCollectionByColor(items: FlowerCollectionItem[]) {
  const groups = new Map<string, FlowerCollectionItem[]>();

  items.forEach((item) => {
    const color = item.flower.color?.trim() || "Chưa phân loại";
    const group = groups.get(color) ?? [];
    group.push(item);
    groups.set(color, group);
  });

  return [...groups.entries()].sort(([colorA], [colorB]) => {
    const orderA = COLOR_ORDER.indexOf(colorA);
    const orderB = COLOR_ORDER.indexOf(colorB);

    if (orderA === -1 && orderB === -1) {
      return colorA.localeCompare(colorB, "vi");
    }
    if (orderA === -1) return 1;
    if (orderB === -1) return -1;
    return orderA - orderB;
  });
}

/**
 * Tổng hợp tiến độ sở hữu của một thành viên.
 * Chỉ tính trên hoa đang hoạt động (isActive = true), cả tử số lẫn mẫu số,
 * để hoa đã soft delete không làm sai lệch phần trăm hoàn thành.
 */
export async function getMemberOwnershipSummary(
  memberId: string,
): Promise<MemberOwnershipSummary> {
  const [ownedCount, totalCount] = await Promise.all([
    prisma.flowerOwner.count({
      where: { memberId, flower: { isActive: true } },
    }),
    prisma.flower.count({ where: { isActive: true } }),
  ]);

  const completionPercentage =
    totalCount === 0 ? 0 : Math.round((ownedCount / totalCount) * 100);

  return { ownedCount, totalCount, completionPercentage };
}

/**
 * Tổng hợp tiến độ sở hữu cho nhiều thành viên trong một lượt truy vấn.
 * Thành viên không sở hữu hoa nào vẫn được trả về mục 0 để card hiển thị đủ.
 */
export async function getMemberOwnershipSummaries(
  memberIds: string[],
): Promise<Map<string, MemberOwnershipSummary>> {
  const summaries = new Map<string, MemberOwnershipSummary>();

  if (memberIds.length === 0) {
    return summaries;
  }

  const [ownedGroups, totalCount] = await Promise.all([
    prisma.flowerOwner.groupBy({
      by: ["memberId"],
      where: { memberId: { in: memberIds }, flower: { isActive: true } },
      _count: { _all: true },
    }),
    prisma.flower.count({ where: { isActive: true } }),
  ]);

  const ownedByMember = new Map(
    ownedGroups.map((group) => [group.memberId, group._count._all]),
  );

  for (const memberId of memberIds) {
    const ownedCount = ownedByMember.get(memberId) ?? 0;

    summaries.set(memberId, {
      ownedCount,
      totalCount,
      completionPercentage:
        totalCount === 0 ? 0 : Math.round((ownedCount / totalCount) * 100),
    });
  }

  return summaries;
}
