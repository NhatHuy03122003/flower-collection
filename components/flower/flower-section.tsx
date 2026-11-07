import type { FlowerCollectionItem } from "@/lib/flower-owner";
import { SectionTitle } from "@/components/shared/section-title";

import { FlowerGrid } from "./flower-grid";

export function FlowerSection({
  color,
  items,
  hasCurrentMember,
  readOnly = false,
}: {
  color: string;
  items: FlowerCollectionItem[];
  hasCurrentMember: boolean;
  readOnly?: boolean;
}) {
  return (
    <section aria-labelledby={`flower-section-${color}`}>
      <div id={`flower-section-${color}`}>
        <SectionTitle title={color} count={items.length} />
      </div>
      <FlowerGrid
        items={items}
        hasCurrentMember={hasCurrentMember}
        readOnly={readOnly}
      />
    </section>
  );
}
