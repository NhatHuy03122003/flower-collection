"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <label className="flex items-center gap-1.5 text-xs font-medium text-rose-900">
        <Users aria-hidden="true" className="size-4 text-rose-500" />
        <span className="sr-only">Thành viên hiện tại</span>
        <select
          value={currentMemberId ?? ""}
          disabled={pending}
          onChange={(event) => {
            const memberId = event.target.value;
            setError(null);
            startTransition(async () => {
              try {
                const result = await setCurrentMemberAction(memberId);

                if (result.status === "success") {
                  router.refresh();
                  return;
                }

                if (result.status === "error") {
                  if (result.code === "UNAUTHENTICATED") {
                    router.push("/login");
                    return;
                  }

                  if (result.code === "FORBIDDEN") {
                    setError("Quyền truy cập thành viên đã thay đổi.");
                    router.refresh();
                    return;
                  }

                  setError(result.message);
                }
              } catch {
                setError("Không thể đổi thành viên lúc này. Vui lòng thử lại.");
              }
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
      {error ? (
        <p role="alert" className="text-[11px] font-medium text-rose-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
