import { Suspense } from "react";
import { Flower2 } from "lucide-react";

import { FlowerSection } from "@/components/flower/flower-section";
import { CollectionHeader } from "@/components/navigation/collection-header";
import { CollectionToolbar } from "@/components/navigation/collection-toolbar";
import { getCurrentMember } from "@/lib/current-member";
import {
  getOwnedFlowerCollection,
  groupCollectionByColor,
} from "@/lib/flower-owner";

export const metadata = {
  title: "Hoa của tôi — Hội ROSE Flower Collection",
};

export default function MyFlowersPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f6d8e1] font-sans text-slate-800">
      <CollectionHeader />
      <Suspense fallback={null}>
        <CollectionToolbar />
      </Suspense>

      <main className="mx-auto w-full max-w-screen-2xl flex-1 px-3 py-4 sm:px-5 sm:py-5">
        <h2 className="mb-3 text-base font-bold tracking-tight text-rose-950 sm:text-lg">
          Tick hoa của tôi
        </h2>

        <Suspense fallback={<MyFlowersLoading />}>
          <MyFlowersContent />
        </Suspense>
      </main>
    </div>
  );
}

async function MyFlowersContent() {
  const currentMember = await getCurrentMember();

  if (!currentMember) {
    return (
      <div className="mx-auto flex min-h-56 max-w-md flex-col items-center justify-center gap-2 px-5 py-12 text-center">
        <Flower2 aria-hidden="true" className="size-8 text-rose-400" />
        <h2 className="text-base font-semibold text-rose-950">
          Chưa chọn thành viên
        </h2>
        <p className="text-sm text-rose-900/65">
          Chọn thành viên ở thanh trên cùng để xem và tick hoa của bạn.
        </p>
      </div>
    );
  }

  const items = await getOwnedFlowerCollection(currentMember.id);

  if (items.length === 0) {
    return (
      <div className="mx-auto flex min-h-56 max-w-md flex-col items-center justify-center gap-2 px-5 py-12 text-center">
        <Flower2 aria-hidden="true" className="size-8 text-rose-400" />
        <h2 className="text-base font-semibold text-rose-950">
          Chưa tick hoa nào
        </h2>
        <p className="text-sm text-rose-900/65">
          {currentMember.displayName} chưa sở hữu hoa nào. Vào danh sách hoa để
          tick.
        </p>
      </div>
    );
  }

  const sections = groupCollectionByColor(items);

  return (
    <div className="space-y-5 sm:space-y-6">
      <p className="text-xs font-medium text-rose-800/65">
        {items.length} hoa · {currentMember.displayName}
      </p>
      {sections.map(([color, colorItems]) => (
        <FlowerSection
          key={color}
          color={color}
          items={colorItems}
          hasCurrentMember
        />
      ))}
    </div>
  );
}

function MyFlowersLoading() {
  return (
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
  );
}
