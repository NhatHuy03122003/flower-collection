import { Badge } from "@/components/ui/badge";
import type { MemberOwnershipSummary } from "@/lib/flower-owner";
import type { Member } from "@/lib/member";

export function MemberOverview({
  member,
  summary,
}: {
  member: Member;
  summary: MemberOwnershipSummary;
}) {
  const initial = member.displayName.trim().charAt(0).toUpperCase() || "?";

  return (
    <section className="flex flex-col gap-3 rounded-2xl bg-white p-3 shadow-[0_2px_8px_rgba(127,29,29,0.08)] ring-1 ring-white/90 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
      <span className="size-14 shrink-0 overflow-hidden rounded-full bg-rose-100 sm:size-16">
        {member.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.avatarUrl}
            alt={member.displayName}
            loading="lazy"
            className="size-full object-cover"
          />
        ) : (
          <span className="flex size-full items-center justify-center text-lg font-semibold text-rose-700">
            {initial}
          </span>
        )}
      </span>

      <div className="min-w-0 flex-1 space-y-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="truncate text-lg font-bold tracking-tight text-rose-950">
            {member.displayName}
          </h2>
          {member.gameHandle ? (
            <Badge
              variant="secondary"
              className="h-5 rounded-full px-2 text-[10px] font-medium"
            >
              {member.gameHandle}
            </Badge>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-2 text-xs font-medium">
            <span className="text-rose-800/70">
              Đã sở hữu {summary.ownedCount}/{summary.totalCount} hoa
            </span>
            <span className="text-sm font-bold text-rose-700">
              {summary.completionPercentage}%
            </span>
          </div>

          <div
            role="progressbar"
            aria-label="Tiến độ sở hữu hoa"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={summary.completionPercentage}
            className="h-2 w-full overflow-hidden rounded-full bg-rose-100"
          >
            <div
              className="h-full rounded-full bg-rose-500"
              style={{ width: `${summary.completionPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
