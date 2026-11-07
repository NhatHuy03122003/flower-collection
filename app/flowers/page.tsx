import { Suspense } from "react";

import { AddFlowerDialog } from "@/components/flower/add-flower-dialog";
import { FlowerManagementList } from "@/components/flower/flower-management-list";
import { ImportFlowerDialog } from "@/components/flower/import-flower-dialog";
import { CollectionHeader } from "@/components/navigation/collection-header";
import { CollectionToolbar } from "@/components/navigation/collection-toolbar";
import { getActiveFlowerNames, getFlowers } from "@/lib/flower";
import { getActiveFlowerOwners } from "@/lib/flower-owner";
import { getMembers } from "@/lib/member";

export const metadata = {
  title: "Quản lý hoa — Hội ROSE Flower Collection",
};

export default function FlowersPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f6d8e1] font-sans text-slate-800">
      <CollectionHeader />
      <Suspense fallback={null}>
        <CollectionToolbar />
      </Suspense>

      <main className="mx-auto w-full max-w-screen-2xl flex-1 px-3 py-4 sm:px-5 sm:py-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold tracking-tight text-rose-950 sm:text-lg">
            Quản lý hoa
          </h2>
          <div className="flex items-center gap-2">
            <Suspense fallback={<ImportFlowerDialog existingNames={[]} />}>
              <ImportFlowerDialogWithNames />
            </Suspense>
            <AddFlowerDialog />
          </div>
        </div>

        <Suspense fallback={<FlowersLoading />}>
          <FlowersContent />
        </Suspense>
      </main>
    </div>
  );
}

async function ImportFlowerDialogWithNames() {
  // Dùng cùng nguồn tên với server import để preview đánh dấu trùng chính xác.
  const existingNames = await getActiveFlowerNames();

  return <ImportFlowerDialog existingNames={existingNames} />;
}

async function FlowersContent() {
  const [flowers, ownersByFlower, members] = await Promise.all([
    getFlowers(),
    getActiveFlowerOwners(),
    getMembers(),
  ]);

  return (
    <div className="space-y-2.5">
      <p className="text-xs font-medium text-rose-800/65">
        {flowers.length} hoa
      </p>
      <FlowerManagementList
        flowers={flowers}
        ownersByFlower={ownersByFlower}
        members={members}
      />
    </div>
  );
}

function FlowersLoading() {
  return (
    <div className="space-y-2.5">
      <div className="h-3 w-16 animate-pulse rounded bg-rose-100" />
      <div className="grid grid-cols-2 gap-3 min-[520px]:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-lg border border-border bg-white shadow-sm"
          >
            <div className="aspect-[4/3] animate-pulse bg-rose-100" />
            <div className="space-y-3 p-4">
              <div className="h-3.5 w-3/4 animate-pulse rounded bg-rose-100" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-rose-50" />
              <div className="h-5 w-24 animate-pulse rounded-md bg-rose-50" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
