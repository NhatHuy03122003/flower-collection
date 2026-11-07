import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { MemberOwnershipSummary } from "@/lib/flower-owner";
import type { Member } from "@/lib/member";

import { DeactivateMemberButton } from "./deactivate-member-button";

export function MemberRow({
  member,
  summary,
}: {
  member: Member;
  summary: MemberOwnershipSummary;
}) {
  const initial = member.displayName.trim().charAt(0).toUpperCase() || "?";

  return (
    <li className="flex flex-col rounded-xl border border-rose-200/70 bg-card shadow-sm transition-all hover:shadow-md">
      <div className="flex flex-1 flex-col items-center gap-3 p-4 text-center">
        <span className="size-20 shrink-0 overflow-hidden rounded-full bg-rose-100">
          {member.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={member.avatarUrl}
              alt={member.displayName}
              loading="lazy"
              className="size-full object-cover"
            />
          ) : (
            <span className="flex size-full items-center justify-center text-2xl font-semibold text-rose-700">
              {initial}
            </span>
          )}
        </span>

        <div className="min-w-0 space-y-0.5">
          <p className="truncate text-lg font-semibold text-slate-900">
            {member.displayName}
          </p>
          {member.gameHandle ? (
            <p className="truncate text-sm text-muted-foreground">
              {member.gameHandle}
            </p>
          ) : null}
        </div>

        <dl className="w-full space-y-1 rounded-lg bg-rose-50/70 px-3 py-2 text-sm">
          <div className="flex items-center justify-between gap-2">
            <dt className="text-muted-foreground">Sở hữu</dt>
            <dd className="font-semibold text-slate-900">
              {summary.ownedCount} hoa
            </dd>
          </div>
          <div className="flex items-center justify-between gap-2">
            <dt className="text-muted-foreground">Hoàn thành</dt>
            <dd className="font-semibold text-slate-900">
              {summary.completionPercentage}%
            </dd>
          </div>
        </dl>
      </div>

      <div className="flex items-center gap-2 border-t border-rose-100 p-3">
        <Button
          render={<Link href={`/members/${member.id}`} />}
          nativeButton={false}
          variant="outline"
          size="sm"
          className="flex-1"
        >
          Chi tiết
        </Button>
        <DeactivateMemberButton
          memberId={member.id}
          displayName={member.displayName}
          className="flex-1"
        />
      </div>
    </li>
  );
}
