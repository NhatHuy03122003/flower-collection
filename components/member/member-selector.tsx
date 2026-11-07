"use client";

import { useTransition } from "react";
import { Users } from "lucide-react";

import { setCurrentMemberAction } from "@/app/actions/flower-owner";
import type { Member } from "@/lib/member";

export function MemberSelector({
  members,
  currentMemberId,
}: {
  members: Member[];
  currentMemberId: string | null;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-1.5 text-xs font-medium text-rose-900">
      <Users aria-hidden="true" className="size-4 text-rose-500" />
      <span className="sr-only">Thành viên hiện tại</span>
      <select
        value={currentMemberId ?? ""}
        disabled={pending}
        onChange={(event) => {
          const memberId = event.target.value;
          startTransition(async () => {
            await setCurrentMemberAction(memberId);
          });
        }}
        className="h-8 max-w-[11rem] truncate rounded-full border border-rose-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition-colors focus-visible:border-rose-400 disabled:opacity-60"
      >
        <option value="">Chọn thành viên…</option>
        {members.map((member) => (
          <option key={member.id} value={member.id}>
            {member.displayName}
          </option>
        ))}
      </select>
    </label>
  );
}
