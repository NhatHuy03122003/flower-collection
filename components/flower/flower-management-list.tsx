import { Flower2 } from "lucide-react";

import type { Flower } from "@/lib/flower";
import type { FlowerOwnerListItem } from "@/lib/flower-owner";
import type { Member } from "@/lib/member";

import { FlowerManagementRow } from "./flower-management-row";

export function FlowerManagementList({
  flowers,
  ownersByFlower,
  members,
}: {
  flowers: Flower[];
  ownersByFlower: Map<string, FlowerOwnerListItem[]>;
  members: Member[];
}) {
  if (flowers.length === 0) {
    return (
      <div className="mx-auto flex min-h-56 max-w-md flex-col items-center justify-center gap-2 px-5 py-12 text-center">
        <Flower2 aria-hidden="true" className="size-8 text-rose-400" />
        <h2 className="text-base font-semibold text-rose-950">
          Chưa có hoa nào
        </h2>
        <p className="text-sm text-rose-900/65">
          Thêm hoa đầu tiên để bắt đầu quản lý bộ sưu tập.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-3 min-[520px]:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
      {flowers.map((flower) => (
        <FlowerManagementRow
          key={flower.id}
          flower={flower}
          owners={ownersByFlower.get(flower.id) ?? []}
          members={members}
        />
      ))}
    </ul>
  );
}
