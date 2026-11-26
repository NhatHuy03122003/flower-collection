import { Suspense } from "react";
import { redirect } from "next/navigation";

import { AdminUsersList } from "@/components/admin/admin-users-list";
import { CollectionHeader } from "@/components/navigation/collection-header";
import { CollectionToolbar } from "@/components/navigation/collection-toolbar";
import { SearchInput, SearchProvider } from "@/components/shared/search";
import { MemberCardSkeletonGrid } from "@/components/shared/skeleton";
import { getAdminUsers } from "@/lib/admin-users";
import { AuthError, requireAdmin } from "@/lib/auth-guard";
import { getMembers } from "@/lib/member";

export const metadata = {
  title: "Quản lý tài khoản — Hội ROSE Flower Collection",
};

export default function AdminUsersPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f6d8e1] font-sans text-slate-800">
      <CollectionHeader />
      <Suspense fallback={null}>
        <CollectionToolbar />
      </Suspense>

      <main className="mx-auto w-full max-w-screen-2xl flex-1 px-3 py-4 sm:px-5 sm:py-5">
        <SearchProvider>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-bold tracking-tight text-rose-950 sm:text-lg">
              Quản lý tài khoản
            </h2>
            <SearchInput placeholder="Tìm theo tên hoặc username..." />
          </div>

          <Suspense fallback={<MemberCardSkeletonGrid count={4} />}>
            <AdminUsersContent />
          </Suspense>
        </SearchProvider>
      </main>
    </div>
  );
}

async function AdminUsersContent() {
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

  const [users, activeMembers] = await Promise.all([
    getAdminUsers(),
    getMembers(),
  ]);

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-rose-800/65">
        {users.length} tài khoản
      </p>
      <AdminUsersList users={users} activeMembers={activeMembers} />
    </div>
  );
}
