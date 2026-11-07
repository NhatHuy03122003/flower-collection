import type { MemberOwnershipSummary } from "@/lib/flower-owner";

export function CollectionSummary({
  summary,
}: {
  summary: MemberOwnershipSummary;
}) {
  const missingCount = Math.max(summary.totalCount - summary.ownedCount, 0);

  const rows = [
    { label: "Tổng hoa", value: String(summary.totalCount) },
    { label: "Đã sở hữu", value: String(summary.ownedCount) },
    { label: "Còn thiếu", value: String(missingCount) },
    { label: "Tiến độ", value: `${summary.completionPercentage}%` },
  ];

  return (
    <section className="rounded-2xl bg-white p-4 shadow-[0_2px_8px_rgba(127,29,29,0.08)] ring-1 ring-white/90">
      <h2 className="mb-3 text-sm font-semibold text-rose-950">
        Collection Summary
      </h2>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {rows.map((row) => (
          <div key={row.label} className="rounded-xl bg-rose-50/70 px-3 py-2">
            <dt className="text-xs text-muted-foreground">{row.label}</dt>
            <dd className="mt-0.5 text-lg font-bold text-rose-800">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
