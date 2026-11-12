import { Suspense } from "react";

import { FlowerCard } from "@/components/flower/flower-card";
import { FlowerCollectionList } from "@/components/flower/flower-collection-list";
import { CollectionHeader } from "@/components/navigation/collection-header";
import { CollectionToolbar } from "@/components/navigation/collection-toolbar";
import { SearchInput, SearchProvider } from "@/components/shared/search";
import { EmptyState } from "@/components/shared/empty-state";
import { FlowerCardSkeletonGrid } from "@/components/shared/skeleton";
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
        <SearchProvider>
          <Suspense fallback={<CollectionLoading />}>
            <FlowerCollection />
          </Suspense>
        </SearchProvider>
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
      <SearchInput placeholder="Tìm theo tên hoa..." />

      <FlowerCollectionList
        sections={sections.map(([color, colorItems]) => ({
          color,
          items: colorItems.map((item) => ({
            id: item.flower.id,
            searchText: [
              item.flower.name,
              item.flower.color,
              item.flower.description,
            ],
            content: (
              <FlowerCard
                flower={item.flower}
                ownerCount={item.ownerCount}
                owners={item.owners}
                isOwnedByCurrentMember={item.isOwnedByCurrentMember}
                hasCurrentMember={hasCurrentMember}
              />
            ),
          })),
        }))}
      />
    </div>
  );
}

function CollectionLoading() {
  return <FlowerCardSkeletonGrid count={6} />;
}
