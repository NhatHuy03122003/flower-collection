import { Suspense } from "react";
import { redirect } from "next/navigation";

import { AdminStatsView } from "@/components/admin/admin-stats-view";
import { CollectionHeader } from "@/components/navigation/collection-header";
import { CollectionToolbar } from "@/components/navigation/collection-toolbar";
import {
  getAdminAccountStats,
  getAdminMemberProgress,
  getAdminTopTickedFlowers,
} from "@/lib/admin-stats";
import { AuthError, requireAdmin } from "@/lib/auth-guard";

export const metadata = {
  title: "Thống kê quản trị — Hội ROSE Flower Collection",
};

export default function AdminStatsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f6d8e1] font-sans text-slate-800">
      <CollectionHeader />
      <Suspense fallback={null}>
        <CollectionToolbar />
      </Suspense>

      <main className="mx-auto w-full max-w-screen-2xl flex-1 px-3 py-4 sm:px-5 sm:py-5">
        <div className="mb-4">
          <h2 className="text-base font-bold tracking-tight text-rose-950 sm:text-lg">
            Thống kê hệ thống
          </h2>
          <p className="text-xs text-rose-900/70">
            Tổng quan tài khoản, tiến độ sở hữu hoa của thành viên và xếp hạng
            hoa phổ biến.
          </p>
        </div>

        <Suspense fallback={<AdminStatsSkeleton />}>
          <AdminStatsContent />
        </Suspense>
      </main>
    </div>
  );
}

async function AdminStatsContent() {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.code === "UNAUTHENTICATED") {
        redirect("/login");
      }
      redirect("/");
    }
    throw error;
  }

  const [accountStats, memberProgress, topFlowers] = await Promise.all([
    getAdminAccountStats(),
    getAdminMemberProgress(),
    getAdminTopTickedFlowers(20),
  ]);

  return (
    <AdminStatsView
      accountStats={accountStats}
      memberProgress={memberProgress}
      topFlowers={topFlowers}
    />
  );
}

function AdminStatsSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="h-12 animate-pulse rounded-2xl bg-white/80" />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="h-28 animate-pulse rounded-2xl bg-white/80" />
        <div className="h-28 animate-pulse rounded-2xl bg-white/80" />
        <div className="h-28 animate-pulse rounded-2xl bg-white/80" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="h-80 animate-pulse rounded-2xl bg-white/80 lg:col-span-7" />
        <div className="h-80 animate-pulse rounded-2xl bg-white/80 lg:col-span-5" />
      </div>
    </div>
  );
}
