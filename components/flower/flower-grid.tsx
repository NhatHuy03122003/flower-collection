import type { FlowerCollectionItem } from "@/lib/flower-owner";

import { FlowerCard } from "./flower-card";

export function FlowerGrid({
  items,
  hasCurrentMember,
  readOnly = false,
}: {
  items: FlowerCollectionItem[];
  hasCurrentMember: boolean;
  readOnly?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 min-[520px]:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
      {items.map((item) => (
        <FlowerCard
          key={item.flower.id}
          flower={item.flower}
          ownerCount={item.ownerCount}
          owners={item.owners}
          isOwnedByCurrentMember={item.isOwnedByCurrentMember}
          hasCurrentMember={hasCurrentMember}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
}
