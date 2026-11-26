"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownWideNarrow,
  ArrowUpRight,
  ArrowUpNarrowWide,
  Award,
  CheckCircle2,
  Flower2,
  UserCheck,
  UserRoundX,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type {
  AdminAccountStats,
  AdminMemberProgressItem,
  AdminTopFlowerItem,
} from "@/lib/admin-stats";
import { normalizeImageUrl } from "@/lib/image-url";

export function AdminStatsView({
  accountStats,
  memberProgress,
  topFlowers,
}: {
  accountStats: AdminAccountStats;
  memberProgress: AdminMemberProgressItem[];
  topFlowers: AdminTopFlowerItem[];
}) {
  const [progressSort, setProgressSort] = useState<"desc" | "asc">("desc");
  const [topLimit, setTopLimit] = useState<10 | 20>(10);

  const totalActiveFlowers = memberProgress[0]?.totalCount ?? 0;

  const averageCompletion = useMemo(() => {
    if (memberProgress.length === 0 || totalActiveFlowers === 0) {
      return 0;
    }

    const totalPercent = memberProgress.reduce(
      (sum, item) => sum + item.completionPercentage,
      0,
    );
    return Math.round(totalPercent / memberProgress.length);
  }, [memberProgress, totalActiveFlowers]);

  const sortedProgress = useMemo(() => {
    const copy = [...memberProgress];
    copy.sort((a, b) => {
      const diff =
        progressSort === "desc"
          ? b.completionPercentage - a.completionPercentage ||
            b.ownedCount - a.ownedCount
          : a.completionPercentage - b.completionPercentage ||
            a.ownedCount - b.ownedCount;
      return diff !== 0 ? diff : a.displayName.localeCompare(b.displayName, "vi");
    });
    return copy;
  }, [memberProgress, progressSort]);

  const visibleTopFlowers = useMemo(
    () => topFlowers.slice(0, topLimit),
    [topFlowers, topLimit],
  );

  const maxOwnerCount = visibleTopFlowers[0]?.ownerCount ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-rose-200/80 bg-white/90 px-4 py-3 shadow-xs sm:px-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-1 font-semibold text-rose-900">
            <Flower2 aria-hidden="true" className="size-3.5" />
            {totalActiveFlowers} hoa đang hoạt động
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
            <Users aria-hidden="true" className="size-3.5" />
            {memberProgress.length} thành viên hoạt động
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/users"
            className="inline-flex h-7 items-center gap-1 rounded-full border border-rose-200 bg-white px-3 text-xs font-semibold text-rose-900 transition-colors hover:bg-rose-50"
          >
            Phân quyền tài khoản
            <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </Link>
          <Link
            href="/flowers"
            className="inline-flex h-7 items-center gap-1 rounded-full border border-rose-200 bg-white px-3 text-xs font-semibold text-rose-900 transition-colors hover:bg-rose-50"
          >
            Quản lý hoa
            <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </Link>
        </div>
      </div>

      <section aria-labelledby="stats-accounts-heading" className="space-y-3">
        <h3 id="stats-accounts-heading" className="sr-only">
          Thống kê tài khoản và phân quyền
        </h3>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <StatKpiCard
            icon={<Users aria-hidden="true" className="size-4 text-rose-700" />}
            label="Tổng số tài khoản USER"
            value={accountStats.totalUsers}
            hint="Không bao gồm tài khoản ADMIN"
          />
          <StatKpiCard
            icon={
              <UserRoundX aria-hidden="true" className="size-4 text-rose-700" />
            }
            label="USER chưa được cấp thành viên"
            value={accountStats.usersWithoutMembers}
            hint="Chưa có thành viên hoạt động nào được gán"
            statusLabel={
              accountStats.usersWithoutMembers > 0
                ? "Cần phân quyền"
                : "Đã phân quyền đủ"
            }
            statusTone={
              accountStats.usersWithoutMembers > 0 ? "attention" : "healthy"
            }
          />
          <StatKpiCard
            icon={
              <UserCheck aria-hidden="true" className="size-4 text-rose-700" />
            }
            label="Thành viên chưa gán cho USER"
            value={accountStats.unassignedMembers}
            hint="Thành viên hoạt động chưa có USER quản lý"
            statusLabel={
              accountStats.unassignedMembers > 0
                ? "Chưa có người quản lý"
                : "Đã gán đủ"
            }
            statusTone={
              accountStats.unassignedMembers > 0 ? "attention" : "healthy"
            }
          />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        <section
          aria-labelledby="stats-progress-heading"
          className="lg:col-span-7"
        >
          <Card className="gap-0 overflow-hidden rounded-2xl border border-rose-200/80 bg-white p-0 shadow-sm ring-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rose-100 px-4 py-3.5 sm:px-5">
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <UserCheck
                    aria-hidden="true"
                    className="size-4 text-rose-700"
                  />
                  <h3
                    id="stats-progress-heading"
                    className="text-sm font-bold tracking-tight text-rose-950 sm:text-base"
                  >
                    Tiến độ tick hoa theo thành viên
                  </h3>
                </div>
                <p className="text-xs text-slate-500">
                  Trung bình hoàn thành:{" "}
                  <span className="font-semibold text-rose-900 tabular-nums">
                    {averageCompletion}%
                  </span>{" "}
                  trên {memberProgress.length} thành viên
                </p>
              </div>

              <div
                role="group"
                aria-label="Sắp xếp tiến độ"
                className="inline-flex rounded-lg border border-rose-200 bg-rose-50/70 p-0.5"
              >
                <button
                  type="button"
                  onClick={() => setProgressSort("desc")}
                  aria-pressed={progressSort === "desc"}
                  className={
                    progressSort === "desc"
                      ? "inline-flex items-center gap-1 rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-rose-950 shadow-xs"
                      : "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-rose-950"
                  }
                >
                  <ArrowDownWideNarrow aria-hidden="true" className="size-3.5" />
                  Cao → thấp
                </button>
                <button
                  type="button"
                  onClick={() => setProgressSort("asc")}
                  aria-pressed={progressSort === "asc"}
                  className={
                    progressSort === "asc"
                      ? "inline-flex items-center gap-1 rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-rose-950 shadow-xs"
                      : "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-rose-950"
                  }
                >
                  <ArrowUpNarrowWide aria-hidden="true" className="size-3.5" />
                  Thấp → cao
                </button>
              </div>
            </div>

            <CardContent className="p-0">
              {sortedProgress.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-1.5 px-5 py-10 text-center">
                  <Users aria-hidden="true" className="size-7 text-rose-300" />
                  <p className="text-sm font-medium text-rose-950">
                    Chưa có thành viên đang hoạt động
                  </p>
                  <p className="text-xs text-slate-500">
                    Thêm thành viên mới tại mục Thành viên để bắt đầu theo dõi
                    tiến độ.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-rose-100">
                  {sortedProgress.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-2 px-4 py-3 transition-colors hover:bg-rose-50/40 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span
                          className={
                            index < 3
                              ? "inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white tabular-nums"
                              : "inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-rose-100 text-xs font-semibold text-rose-900 tabular-nums"
                          }
                        >
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <Link
                            href={`/members/${item.id}`}
                            className="block truncate text-sm font-semibold text-rose-950 hover:text-rose-700 hover:underline"
                          >
                            {item.displayName}
                          </Link>
                          {item.gameHandle ? (
                            <p className="truncate text-[11px] text-slate-500">
                              @{item.gameHandle}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 sm:w-64 sm:shrink-0">
                        <div
                          aria-hidden="true"
                          className="h-2 flex-1 overflow-hidden rounded-full bg-rose-100"
                        >
                          <div
                            className="h-full rounded-full bg-rose-500 transition-all duration-300"
                            style={{ width: `${item.completionPercentage}%` }}
                          />
                        </div>
                        <div className="flex w-24 shrink-0 items-center justify-end gap-1.5 text-xs tabular-nums">
                          <span className="text-slate-500">
                            {item.ownedCount}/{item.totalCount}
                          </span>
                          <span className="rounded-md bg-rose-100/80 px-1.5 py-0.5 font-bold text-rose-900">
                            {item.completionPercentage}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section
          aria-labelledby="stats-top-flowers-heading"
          className="lg:col-span-5"
        >
          <Card className="gap-0 overflow-hidden rounded-2xl border border-rose-200/80 bg-white p-0 shadow-sm ring-0">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-100 px-4 py-3.5 sm:px-5">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Award aria-hidden="true" className="size-4 text-rose-700" />
                  <h3
                    id="stats-top-flowers-heading"
                    className="text-sm font-bold tracking-tight text-rose-950 sm:text-base"
                  >
                    Hoa được tick nhiều nhất
                  </h3>
                </div>
                <p className="text-xs text-slate-500">
                  Xếp hạng theo số thành viên sở hữu
                </p>
              </div>

              <div
                role="group"
                aria-label="Giới hạn xếp hạng hoa"
                className="inline-flex rounded-lg border border-rose-200 bg-rose-50/70 p-0.5"
              >
                <button
                  type="button"
                  onClick={() => setTopLimit(10)}
                  aria-pressed={topLimit === 10}
                  className={
                    topLimit === 10
                      ? "rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-rose-950 shadow-xs"
                      : "rounded-md px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-rose-950"
                  }
                >
                  Top 10
                </button>
                <button
                  type="button"
                  onClick={() => setTopLimit(20)}
                  aria-pressed={topLimit === 20}
                  className={
                    topLimit === 20
                      ? "rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-rose-950 shadow-xs"
                      : "rounded-md px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-rose-950"
                  }
                >
                  Top 20
                </button>
              </div>
            </div>

            <CardContent className="p-0">
              {visibleTopFlowers.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-1.5 px-5 py-10 text-center">
                  <Flower2 aria-hidden="true" className="size-7 text-rose-300" />
                  <p className="text-sm font-medium text-rose-950">
                    Chưa có dữ liệu tick hoa
                  </p>
                  <p className="text-xs text-slate-500">
                    Khi thành viên bắt đầu đánh dấu hoa, bảng xếp hạng sẽ hiển
                    thị tại đây.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-rose-100">
                  {visibleTopFlowers.map((flower, index) => {
                    const barWidthPercent =
                      maxOwnerCount > 0
                        ? Math.max(
                            6,
                            Math.round(
                              (flower.ownerCount / maxOwnerCount) * 100,
                            ),
                          )
                        : 0;

                    return (
                      <div
                        key={flower.id}
                        className="space-y-2 px-4 py-3 transition-colors hover:bg-rose-50/40 sm:px-5"
                      >
                        <div className="flex items-center justify-between gap-2.5">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <span
                              className={
                                index < 3
                                  ? "inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white tabular-nums"
                                  : "inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-rose-100 text-xs font-semibold text-rose-900 tabular-nums"
                              }
                            >
                              {index + 1}
                            </span>
                            <FlowerThumbnail
                              imageUrl={flower.imageUrl}
                              name={flower.name}
                            />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-rose-950">
                                {flower.name}
                              </p>
                              {flower.color ? (
                                <p className="truncate text-[11px] text-slate-500">
                                  {flower.color}
                                </p>
                              ) : null}
                            </div>
                          </div>

                          <Badge className="shrink-0 rounded-full bg-rose-100 px-2.5 text-xs font-semibold text-rose-900 tabular-nums">
                            {flower.ownerCount} thành viên
                          </Badge>
                        </div>

                        <div
                          aria-hidden="true"
                          className="h-1.5 w-full overflow-hidden rounded-full bg-rose-100/80"
                        >
                          <div
                            className="h-full rounded-full bg-rose-500 transition-all duration-300"
                            style={{ width: `${barWidthPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

function FlowerThumbnail({
  imageUrl,
  name,
}: {
  imageUrl: string;
  name: string;
}) {
  const [hasError, setHasError] = useState(false);
  const normalizedUrl = normalizeImageUrl(imageUrl);

  if (!normalizedUrl || hasError) {
    return (
      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-rose-500">
        <Flower2 aria-hidden="true" className="size-4" />
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={normalizedUrl}
      alt={name}
      loading="lazy"
      onError={() => setHasError(true)}
      className="size-9 shrink-0 rounded-lg border border-rose-100 bg-rose-50 object-cover"
    />
  );
}

function StatKpiCard({
  icon,
  label,
  value,
  hint,
  statusLabel,
  statusTone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  hint: string;
  statusLabel?: string;
  statusTone?: "attention" | "healthy";
}) {
  return (
    <Card className="gap-0 rounded-2xl border border-rose-200/80 bg-white p-0 shadow-sm ring-0">
      <CardContent className="space-y-2 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-medium text-slate-600">{label}</p>
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-xl bg-rose-100/80">
            {icon}
          </span>
        </div>

        <div className="flex items-baseline justify-between gap-2">
          <p className="text-3xl font-bold tracking-tight text-rose-950 tabular-nums">
            {value}
          </p>
          {statusLabel ? (
            <span
              className={
                statusTone === "healthy"
                  ? "inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700"
                  : "inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800"
              }
            >
              {statusTone === "healthy" ? (
                <CheckCircle2 aria-hidden="true" className="size-3" />
              ) : null}
              {statusLabel}
            </span>
          ) : null}
        </div>

        <p className="text-[11px] text-slate-500">{hint}</p>
      </CardContent>
    </Card>
  );
}
