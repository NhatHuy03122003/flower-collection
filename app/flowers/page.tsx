import { Suspense } from "react";

import { AddFlowerDialog } from "@/components/flower/add-flower-dialog";
import { ArchivedFlowerList } from "@/components/flower/archived-flower-list";
import { FlowerManagementList } from "@/components/flower/flower-management-list";
import { FlowerStatusSwitch } from "@/components/flower/flower-status-switch";
import { ImportFlowerDialog } from "@/components/flower/import-flower-dialog";
import { CollectionHeader } from "@/components/navigation/collection-header";
import { CollectionToolbar } from "@/components/navigation/collection-toolbar";
import { SearchInput, SearchProvider } from "@/components/shared/search";
import { FlowerCardSkeletonGrid } from "@/components/shared/skeleton";
import { getArchivedFlowers, getFlowers } from "@/lib/flower";
import { getActiveFlowerOwners } from "@/lib/flower-owner";
import { getMembers } from "@/lib/member";

export const metadata = {
  title: "Quản lý hoa — Hội ROSE Flower Collection",
};

export default function FlowersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[] }>;
}) {
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
              Quản lý hoa
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <SearchInput placeholder="Tìm theo tên hoa..." />
              <Suspense fallback={null}>
                <FlowerStatusSwitch />
              </Suspense>
              <Suspense fallback={<ImportFlowerDialog existingNames={[]} />}>
                <ImportFlowerDialogWithNames />
              </Suspense>
              <AddFlowerDialog />
            </div>
          </div>

          <Suspense fallback={<FlowersLoading />}>
            <FlowersStatusContent searchParams={searchParams} />
          </Suspense>
        </SearchProvider>
      </main>
    </div>
  );
}

async function FlowersStatusContent({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[] }>;
}) {
  const params = await searchParams;
  const showArchived = params.status === "all";

  return (
    <div className="space-y-6">
      <FlowersContent />
      {showArchived ? <ArchivedFlowersContent /> : null}
    </div>
  );
}

async function ImportFlowerDialogWithNames() {
  // Dùng lại getFlowers() (đã cache trong cùng request) thay vì query tên hoa
  // riêng, vừa không lệch nguồn dữ liệu vừa giảm số query tới Prisma.
  const flowers = await getFlowers();
  const existingNames = flowers.map((flower) => flower.name);

  return <ImportFlowerDialog existingNames={existingNames} />;
}

async function FlowersContent() {
  const [flowers, ownersByFlower, members] = await Promise.all([
    getFlowers(),
    getActiveFlowerOwners(),
    getMembers(),
  ]);

  return (
    <section className="space-y-2.5">
      <p className="text-xs font-medium text-rose-800/65">
        {flowers.length} hoa đang hoạt động
      </p>
      <FlowerManagementList
        flowers={flowers}
        ownersByFlower={ownersByFlower}
        members={members}
      />
    </section>
  );
}

async function ArchivedFlowersContent() {
  const flowers = await getArchivedFlowers();

  return (
    <section className="space-y-2.5 border-t border-rose-200 pt-6">
      <div className="flex items-baseline gap-2">
        <h3 className="text-sm font-semibold tracking-tight text-rose-950">
          Hoa đã ẩn
        </h3>
        <span className="text-xs font-medium text-rose-800/65">
          {flowers.length} hoa
        </span>
      </div>
      <ArchivedFlowerList flowers={flowers} />
    </section>
  );
}

function FlowersLoading() {
  return (
    <div className="space-y-2.5">
      <div className="h-3 w-16 animate-pulse rounded bg-rose-100" />
      <FlowerCardSkeletonGrid count={6} />
    </div>
  );
}
