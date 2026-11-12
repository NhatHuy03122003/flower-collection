import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getDisplayImageUrl, type Flower } from "@/lib/flower";
import type { FlowerOwnerListItem } from "@/lib/flower-owner";
import type { Member } from "@/lib/member";

import { DeactivateFlowerButton } from "./deactivate-flower-button";
import { EditFlowerDialog } from "./edit-flower-dialog";
import { FlowerOwnerList } from "./flower-owner-list";
import { FlowerOwnerSelect } from "./flower-owner-select";

export function FlowerManagementRow({
  flower,
  owners,
  members,
}: {
  flower: Flower;
  owners: FlowerOwnerListItem[];
  members: Member[];
}) {
  return (
    <li className="h-full">
      <Card className="h-full gap-0 rounded-lg border border-border bg-white p-0 shadow-sm ring-0 transition-shadow hover:shadow-md">
        <div className="aspect-[4/3] overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getDisplayImageUrl(flower.imageUrl)}
            alt={flower.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="size-full object-cover"
          />
        </div>

        <CardContent className="flex flex-1 flex-col gap-3 p-4">
          <div className="space-y-2">
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
              {flower.name}
            </h3>
            <p className="break-words text-xs leading-relaxed text-muted-foreground">
              {flower.description?.trim() || "Chưa có mô tả"}
            </p>
          </div>

          <FlowerOwnerList ownerCount={owners.length} owners={owners} />

          <div className="mt-auto space-y-2">
            <FlowerOwnerSelect
              flowerId={flower.id}
              owners={owners}
              members={members}
            />
            <div className="flex items-center justify-between gap-2">
              <Badge
                variant="secondary"
                className="rounded-md px-2 text-xs font-medium"
              >
                {flower.color?.trim() || "Chưa phân loại"}
              </Badge>
              <div className="flex items-center gap-1">
                <EditFlowerDialog flower={flower} />
                <DeactivateFlowerButton
                  flowerId={flower.id}
                  name={flower.name}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </li>
  );
}
