import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Bố cục lưới giống hệt danh sách hoa thực tế (2 cột mobile, auto-fill desktop). */
const FLOWER_GRID_CLASS =
  "grid grid-cols-2 gap-3 min-[520px]:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]";

/** Bố cục lưới giống hệt danh sách thành viên thực tế. */
const MEMBER_GRID_CLASS =
  "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3";

const pulseBlock = "animate-pulse rounded bg-rose-100";

/** Skeleton 1 card hoa, dựng theo đúng bố cục của FlowerCard. */
export function FlowerCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-white shadow-sm",
        className,
      )}
    >
      <div className="aspect-[4/3] animate-pulse bg-rose-100" />
      <div className="space-y-3 p-4">
        <div className={cn("h-3.5 w-3/4", pulseBlock)} />
        <div className="h-3 w-2/3 animate-pulse rounded bg-rose-50" />
        <div className="h-5 w-24 animate-pulse rounded-md bg-rose-50" />
      </div>
    </div>
  );
}

/**
 * Lưới skeleton card hoa.
 * Mặc định 6 card desktop và 2 card mobile (ẩn bớt các card thừa dưới 520px).
 */
export function FlowerCardSkeletonGrid({
  count = 6,
  mobileCount = 2,
  className,
}: {
  count?: number;
  mobileCount?: number;
  className?: string;
}) {
  return (
    <div className={cn(FLOWER_GRID_CLASS, className)}>
      {Array.from({ length: count }, (_, index) => (
        <FlowerCardSkeleton
          key={index}
          className={cn(index >= mobileCount && "hidden min-[520px]:block")}
        />
      ))}
    </div>
  );
}

/** Skeleton 1 card thành viên, dựng theo đúng bố cục của MemberRow. */
export function MemberCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex flex-col rounded-xl border border-rose-200/70 bg-card shadow-sm",
        className,
      )}
    >
      <div className="flex flex-1 flex-col items-center gap-3 p-4 text-center">
        <span className="size-20 shrink-0 animate-pulse rounded-full bg-rose-100" />
        <div className="w-full space-y-1.5">
          <div className={cn("mx-auto h-5 w-32", pulseBlock)} />
          <div className="mx-auto h-4 w-20 animate-pulse rounded bg-rose-50" />
        </div>
        <div className="h-14 w-full animate-pulse rounded-lg bg-rose-50" />
      </div>
      <div className="grid grid-cols-3 gap-2 border-t border-rose-100 p-3">
        <div className={cn("h-7", pulseBlock)} />
        <div className={cn("h-7", pulseBlock)} />
        <div className={cn("h-7", pulseBlock)} />
      </div>
    </div>
  );
}

/** Lưới skeleton card thành viên. */
export function MemberCardSkeletonGrid({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn(MEMBER_GRID_CLASS, className)}>
      {Array.from({ length: count }, (_, index) => (
        <MemberCardSkeleton key={index} />
      ))}
    </div>
  );
}

/**
 * Khung trang dùng cho route loading: giữ nguyên nền, header và vùng main
 * để tránh nhảy layout khi chuyển trang.
 */
export function CollectionPageSkeleton({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f6d8e1] font-sans text-slate-800">
      <header className="border-b border-rose-200/80 bg-[#fff8fa]">
        <div className="mx-auto flex min-h-14 w-full max-w-screen-2xl items-center justify-between gap-3 px-3 py-2 sm:px-5">
          <span
            aria-hidden="true"
            className="h-5 w-44 animate-pulse rounded bg-rose-100"
          />
          <span
            aria-hidden="true"
            className="h-8 w-40 animate-pulse rounded-full bg-rose-100"
          />
        </div>
      </header>
      <main className="mx-auto w-full max-w-screen-2xl flex-1 px-3 py-4 sm:px-5 sm:py-5">
        {children}
      </main>
    </div>
  );
}

/** Thanh tiêu đề + khu vực công cụ (search, nút) ở đầu các trang quản lý. */
export function ToolbarRowSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "mb-3 flex flex-wrap items-center justify-between gap-3",
        className,
      )}
    >
      <span className="h-5 w-28 animate-pulse rounded bg-rose-100" />
      <span className="h-8 w-60 animate-pulse rounded-full bg-rose-100" />
    </div>
  );
}

/** Skeleton khung đăng nhập/đăng ký. */
export function AuthCardSkeleton({ fields = 2 }: { fields?: number }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f6d8e1] px-4 py-10 font-sans">
      <div className="w-full max-w-sm rounded-2xl border border-rose-200/80 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col items-center gap-2">
          <span className="size-7 animate-pulse rounded-full bg-rose-100" />
          <span className="h-5 w-44 animate-pulse rounded bg-rose-100" />
          <span className="h-3 w-28 animate-pulse rounded bg-rose-50" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: fields }, (_, index) => (
            <div key={index} className="space-y-1.5">
              <span className="block h-3 w-24 animate-pulse rounded bg-rose-100" />
              <span className="block h-8 w-full animate-pulse rounded-lg bg-rose-50" />
            </div>
          ))}
          <span className="block h-8 w-full animate-pulse rounded-lg bg-rose-100" />
        </div>
      </div>
    </div>
  );
}
