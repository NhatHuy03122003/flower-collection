import { Suspense } from "react";

import { FlowerSection } from "@/components/flower/flower-section";
import { CollectionHeader } from "@/components/navigation/collection-header";
import { CollectionToolbar } from "@/components/navigation/collection-toolbar";
import { EmptyState } from "@/components/shared/empty-state";
import { getCurrentMember } from "@/lib/current-member";
import { getFlowerCollection, groupCollectionByColor } from "@/lib/flower-owner";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f6d8e1] font-sans text-slate-800">
      <CollectionHeader />
      <Suspense fallback={null}>
        <CollectionToolbar />
      </Suspense>

      <main className="mx-auto w-full max-w-screen-2xl flex-1 px-3 py-4 sm:px-5 sm:py-5">
        <Suspense fallback={<CollectionLoading />}>
          <FlowerCollection />
        </Suspense>
      </main>
    </div>
  );
}

async function FlowerCollection() {
  const currentMember = await getCurrentMember();
  const items = await getFlowerCollection(currentMember?.id ?? null);

  if (items.length === 0) {
    return <EmptyState />;
  }

  const sections = groupCollectionByColor(items);
  const hasCurrentMember = currentMember !== null;

  return (
    <div className="space-y-5 sm:space-y-6">
      {sections.map(([color, colorItems]) => (
        <FlowerSection
          key={color}
          color={color}
          items={colorItems}
          hasCurrentMember={hasCurrentMember}
        />
      ))}
    </div>
  );
}

function CollectionLoading() {
  return (
    <div className="grid grid-cols-2 gap-3 min-[520px]:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
      {Array.from({ length: 10 }, (_, index) => (
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
