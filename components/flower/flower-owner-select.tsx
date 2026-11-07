"use client";

import { useTransition } from "react";

import { assignFlowerOwnerAction } from "@/app/actions/flower-owner";
import type { FlowerOwnerListItem } from "@/lib/flower-owner";
import type { Member } from "@/lib/member";

export function FlowerOwnerSelect({
  flowerId,
  owners,
  members,
}: {
  flowerId: string;
  owners: FlowerOwnerListItem[];
  members: Member[];
}) {
  const [pending, startTransition] = useTransition();
  const currentOwnerId = owners[0]?.id ?? "";

  return (
    <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
      <span className="shrink-0 text-muted-foreground">Owner:</span>
      <select
        value={currentOwnerId}
        disabled={pending}
        aria-label="Chủ sở hữu hoa"
        onChange={(event) => {
          const memberId = event.target.value;

          startTransition(async () => {
            await assignFlowerOwnerAction(flowerId, memberId);
          });
        }}
        className="h-7 min-w-0 flex-1 truncate rounded-md border border-rose-200 bg-white px-2 text-xs font-semibold text-slate-700 outline-none transition-colors focus-visible:border-rose-400 disabled:opacity-60"
      >
        <option value="">Chưa có chủ</option>
        {members.map((member) => (
          <option key={member.id} value={member.id}>
            {member.displayName}
          </option>
        ))}
      </select>
    </label>
  );
}
